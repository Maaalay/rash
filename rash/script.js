// Add basic interactivity
console.log("Welcome to Rashi's Birthday Website!");

// Spotify Authentication Flow
const spotifyLoginButton = document.querySelector("#spotify-login");

spotifyLoginButton.addEventListener("click", () => {
  window.location.href = 'http://localhost:8888/login'; // Redirect to the server to authenticate
});

// Handle "Notes" feature
const notesButton = document.querySelector("#notes button");
const notesSection = document.querySelector("#notes");

notesButton.addEventListener("click", () => {
  const note = prompt("Write your note:");
  if (note) {
    const noteParagraph = document.createElement("p");
    noteParagraph.textContent = note;
    notesSection.appendChild(noteParagraph);
  } else {
    alert("No note written!");
  }
});

// Handle "Media Upload" feature
const mediaButton = document.querySelector("#media button");
const mediaSection = document.querySelector("#media");

mediaButton.addEventListener("click", () => {
  const mediaInput = document.createElement("input");
  mediaInput.type = "file";
  mediaInput.accept = "image/*";
  
  mediaInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        const img = document.createElement("img");
        img.src = reader.result;
        mediaSection.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      alert("No file selected!");
    }
  });

  mediaInput.click();
});

// Handle "Game" feature (basic example: Smash or Pass)
const gameButton = document.querySelector("#game button");
const gameSection = document.querySelector("#game");

gameButton.addEventListener("click", () => {
  const choices = ["Smash", "Pass"];
  const choice = choices[Math.floor(Math.random() * choices.length)];
  
  const resultParagraph = document.createElement("p");
  resultParagraph.textContent = `You got: ${choice}!`;
  gameSection.appendChild(resultParagraph);
});

// Spotify Integration (assumed access token for now)
let spotifyAccessToken = "";  // You'll get the access token after Spotify authentication

// Function to play a song
function playSong() {
  if (spotifyAccessToken) {
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${spotifyAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uris: ["spotify:track:4uLU6hMCjMI75M1Loo6eW5"] // Sample song URI
      })
    }).then(response => {
      if (response.ok) {
        alert("Song is now playing!");
      } else {
        alert("Failed to play the song.");
      }
    });
  } else {
    alert("Please login to Spotify first!");
  }
}

// Handle "Listen to Music" feature (after Spotify login)
const musicButton = document.querySelector("#music button");

musicButton.addEventListener("click", () => {
  playSong();
});

// Spotify Authentication - Check if access token is available
// You will need to get the access token from the backend server after the user logs in with Spotify.
function checkSpotifyAuth() {
  const token = localStorage.getItem("spotify_access_token");
  if (token) {
    spotifyAccessToken = token;
    document.querySelector("#spotify-status").textContent = "Logged in to Spotify!";
  } else {
    document.querySelector("#spotify-status").textContent = "Not logged in.";
  }
}

// Call the checkSpotifyAuth function when the page loads
window.addEventListener("load", checkSpotifyAuth);
