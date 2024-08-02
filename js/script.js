console.log("Lets write some JS!")

let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`${currFolder}`)
    let data = await a.text();
    // console.log(data);
    let div = document.createElement('div');
    div.innerHTML = data;
    let as = div.getElementsByTagName('a');
    // console.log(as); 
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith('mp3')){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    
    //Show all the songs in the playlist
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="images/musicIcon.svg" alt=""> 
                            <div class="info">
                                <div>${song.replaceAll("%20"," ").split('.mp3').slice(-2,1)[0]}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <svg style="scale: 0.7;" class="invert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none">
                                    <polygon points="8,5 20,12 8,19" fill="#000000"/>
                                </svg>                           
                            </div>
                        </li>`;
    }

    

    //Attach an event listener to each songs
    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach((e)=>{
        e.addEventListener("click",()=>{
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.replaceAll('amp;','')+'.mp3');
        })
    })
    
    return songs;
}

function playMusic(track, pause=false){
    // let audio = new Audio("songs/" + track);
    currentSong.src = `${currFolder}/` + track
    if(!pause){
        currentSong.play();
        playToggle.src = "images/pause.svg";
    }
    // document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songinfo').innerHTML = track.replaceAll("%20"," ").split('.mp3').slice(-2,1)[0];
    document.querySelector('.songtime').innerHTML = '0:00 / 0:00';
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    let secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${minutes}:${secs}`;
}


async function displayAlbums(){
    let a = await fetch(`songs`)
    let data = await a.text();
    let div = document.createElement('div');
    div.innerHTML = data;
    let anchors = div.getElementsByTagName('a');
    let array = Array.from(anchors);
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs")){
            let folder = e.href.split('/').slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`songs/${folder}/info.json`)
            let data = await a.json();
            
            //Populate the card container with the albums along with their metadata
            let cardContainer = document.querySelector('.cardContainer');
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <img src="songs/${folder}/cover.jpg" alt="img">
                        <h2>${data.title}</h2>
                        <p>${data.description}</p>
                        <div class="playIcon">
                            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 26 26">
                                <circle cx="13" cy="13" r="12" fill="#1abc54"></circle>
                                <path d="m8.05 5.606 13.49 7.788a.7.7 0 0 1 0 1.212L8.05 21.394A.7.7 0 0 1 7 20.788V6.212a.7.7 0 0 1 1.05-.606z" fill="black"></path>
                              </svg>
                        </div>
                    </div>`
        }
    }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName('card')).forEach(e=>{
        e.addEventListener("click",async f=>{
            songs = await getSongs(`songs/${f.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    })
}


async function main(){

    //Get list of all songs
    console.log(window.location.pathname);
    await getSongs('songs/ncs');
    playMusic(songs[0],true);


    //Display all the albums on the page
    displayAlbums();



    //Attach an event listener to play, next and prev buttons
    playToggle.addEventListener("click", ()=>{
        if (currentSong.paused) {
            currentSong.play();
            playToggle.src = "images/pause.svg";
        }
        else{
            currentSong.pause();
            playToggle.src = "images/play.svg";
        }
    })

    //Attach an event listener for time update event
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector('.songtime').innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector('.circle').style.left = (currentSong.currentTime/currentSong.duration) * 100 + '%';
        document.querySelector('.played').style.width = (currentSong.currentTime/currentSong.duration) * 100 + '%';
    })
    

    //Attach an event listener to seekbar
    document.querySelector('.seekbar').addEventListener("click",(e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        console.log(e.target)
        document.querySelector('.circle').style.left = percent + '%';
        document.querySelector('.played').style.width = percent + '%'; 
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    })


    //Attach an event listener to hamburger
    document.querySelector('.hamburger').addEventListener("click",()=>{
        document.querySelector('.left').style.left = '0';
    })

    //Attach an event listener to close button
    document.querySelector('.close').addEventListener("click",()=>{
        document.querySelector('.left').style.left = '-200%';
    })


    //Attach an event listener to prev button
    prev.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index-1 >= 0){
            playMusic(songs[index+-1]);
        }
    })



    //Attach an event listener to prev button
    next.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index+1 < songs.length){
            playMusic(songs[index+1]);
        }

    })


    //Attach an event listener to volume button
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener("change",(e)=>{
        console.log('Setting volume to',e.target.value,'/100');
        currentSong.volume = parseInt(e.target.value) /100;
    })
    
    
    //Attach an event listener to mute the track
    document.querySelector('.vol img').addEventListener("click",(e)=>{
        if(e.target.src.includes("images/volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector('.range').getElementsByTagName('input')[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = 0.1;
            document.querySelector('.range').getElementsByTagName('input')[0].value = 10;

        }
    })
    
    
}
 
main();
