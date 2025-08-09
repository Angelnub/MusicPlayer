const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const playerContainer = document.getElementById('playerContainer');

const songs = [
    { title: "I Like You So Much, You’ll Know It", artist: "Ysabelle", src: "music/song1.mp3", cover: "cover/ilysmyki.jpg" },
    { title: "Every Summertime", artist: "NIKI", src: "music/song2.mp3", cover: "cover/everysummertime.jpg" },
    { title: "Fearless", artist: "Taylor Swift", src: "music/song3.mp3", cover: "cover/fearless.jpg" },
    { title: "One Dance", artist: "Drake", src: "music/song4.mp3", cover: "cover/onedance.jpg" }
];

let songIndex = 0;
let audio = new Audio();

function renderCarousel() {
    playerContainer.innerHTML = "";

    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.classList.add('player');
        if (index === songIndex) card.classList.add('active');

        card.innerHTML = `
            <div class="cover">
                <img src="${song.cover}" alt="Album Cover">
            </div>
            <h2>${song.title}</h2>
            <h3>${song.artist}</h3>
            ${index === songIndex ? `
            <audio id="audio" src="${song.src}"></audio>
            <div class="controls">
                <button id="prev">&#9664;</button>
                <button id="play">&#9658;</button>
                <button id="next">&#9654;</button>
            </div>
            <input type="range" id="progress" value="0" step="1">
            <div class="time">
                <span id="current">0:00</span>
                <span id="duration">0:00</span>
            </div>
            ` : ''}
        `;

        if (index !== songIndex) {
            card.addEventListener('click', () => {
                songIndex = index;
                loadSong(true);
            });
        }

        playerContainer.appendChild(card);
    });

    centerActiveCard();
    attachControls();
}

function centerActiveCard() {
    const carousel = document.querySelector('.carousel');
    const activeCard = document.querySelector('.player.active');
    if (!activeCard) return;

    playerContainer.style.transform = "none";
    const carouselCenter = carousel.offsetWidth / 2;
    const cardCenter = activeCard.offsetLeft + (activeCard.offsetWidth / 2);
    const shift = carouselCenter - cardCenter;
    playerContainer.style.transform = `translateX(${shift}px)`;
}

function loadSong(autoPlay = true) {
    renderCarousel();
    audio = document.getElementById('audio');
    if (!audio) return;

    const progress = document.getElementById('progress');
    const currentTimeEl = document.getElementById('current');
    const durationEl = document.getElementById('duration');

    // Show duration when metadata is ready
    audio.addEventListener('loadedmetadata', () => {
        let durationMinutes = Math.floor(audio.duration / 60) || 0;
        let durationSeconds = Math.floor(audio.duration % 60) || 0;
        if (durationSeconds < 10) durationSeconds = `0${durationSeconds}`;
        durationEl.textContent = `${durationMinutes}:${durationSeconds}`;
    });


    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progress.value = (audio.currentTime / audio.duration) * 100;
        }
        let currentMinutes = Math.floor(audio.currentTime / 60) || 0;
        let currentSeconds = Math.floor(audio.currentTime % 60) || 0;
        if (currentSeconds < 10) currentSeconds = `0${currentSeconds}`;
        currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
    });

    if (autoPlay) {
        audio.play().then(() => {
            const playBtn = document.getElementById('play');
            if (playBtn) playBtn.innerHTML = '&#10074;&#10074;';
        }).catch(err => {
            console.log("Autoplay blocked by browser:", err);
        });
    }
}

function attachControls() {
    const playBtn = document.getElementById('play');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const progress = document.getElementById('progress');

    if (!audio) return;

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '&#10074;&#10074;';
        } else {
            audio.pause();
            playBtn.innerHTML = '&#9658;';
        }
    });

    prevBtn.addEventListener('click', () => {
        songIndex = (songIndex - 1 + songs.length) % songs.length;
        loadSong(true);
    });

    nextBtn.addEventListener('click', () => {
        songIndex = (songIndex + 1) % songs.length;
        loadSong(true);
    });

    progress.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (progress.value / 100) * audio.duration;
        }
    });

    audio.addEventListener('ended', () => {
        nextBtn.click();
    });
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    suggestions.innerHTML = "";

    if (!query) {
        suggestions.style.display = "none";
        return;
    }

    const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );

    if (filtered.length > 0) {
        filtered.forEach(song => {
            const li = document.createElement('li');
            li.textContent = `${song.title} - ${song.artist}`;
            li.addEventListener('click', () => {
                songIndex = songs.indexOf(song);
                loadSong(true);
                suggestions.style.display = "none";
                searchInput.value = "";
            });
            suggestions.appendChild(li);
        });
        suggestions.style.display = "block";
    } else {
        suggestions.style.display = "none";
    }
});

window.addEventListener('resize', () => {
    requestAnimationFrame(centerActiveCard);
});

loadSong(true);
