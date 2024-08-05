console.log("Lets write some JS!")
const baseUrl = window.location.origin + '/' + window.location.pathname.split('/')[1] + '/';

let currentSong = new Audio();
let songs;
let currFolder;

async function fetchGitHubContent(path) {
  const url = `https://api.github.com/repos/Rijul-Sharma/Spotify-Clone/contents/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching content from GitHub:', error);
  }
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetchGitHubContent(currFolder);
    songs = a.filter(function(item) {
    return item.name.endsWith('.mp3');
    }).map(function(item) {
    return item.name;
    });
    
    //Show all the songs in the playlist
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="images/musicIcon.svg" alt=""> 
                            <div class="info">
                                <div>${decodeURIComponent(song).split('.mp3')[0]}</div>
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
            playMusic(e.querySelector('.info').firstElementChild.innerHTML + '.mp3');
        })
    })
    
    return songs;
}

async function playMusic(track, pause=false){
    // let audio = new Audio("songs/" + track);
    if (!track) {
        console.error('Track is undefined');
        return;
    }
    const trackUrl = await fetchGitHubContent(`${currFolder}/${track}`).then(file => file.download_url);
    currentSong.src = trackUrl;
    if(!pause){
        currentSong.play();
        playToggle.src = "images/pause.svg";
    }
    // document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songinfo').innerHTML = decodeURIComponent(track).split('.mp3')[0];
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
    let a = await fetchGitHubContent(songs);
    let albums = a.filter(item => item.type === 'dir');
    
    for(album of albums){
        let folder = album.name;
        let albumMeta = await fetchGitHubContent(`songs/${folder}/info.json`).then(response => response);
        let albumCover = await fetchGitHubContent(`songs/${folder}/cover.jpg`).then(response => response.url);
        //Populate the card container with the albums along with their metadata
            let cardContainer = document.querySelector('.cardContainer');
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <img src="${albumCover}" alt="img">
                        <h2>${albumMeta.title}</h2>
                        <p>${albumMeta.description}</p>
                        <div class="playIcon">
                            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 26 26">
                                <circle cx="13" cy="13" r="12" fill="#1abc54"></circle>
                                <path d="m8.05 5.606 13.49 7.788a.7.7 0 0 1 0 1.212L8.05 21.394A.7.7 0 0 1 7 20.788V6.212a.7.7 0 0 1 1.05-.606z" fill="black"></path>
                              </svg>
                        </div>
                    </div>`
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
    document.getElementById('playToggle').addEventListener("click", ()=>{
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById('playToggle').src = "images/pause.svg";
        }
        else{
            currentSong.pause();
            document.getElementById('playToggle').src = "images/play.svg";
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
    document.getElementById('prev').addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index-1 >= 0){
            playMusic(songs[index-1]);
        }
    })



    //Attach an event listener to prev button
    document.getElementById('next').addEventListener("click",()=>{
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
