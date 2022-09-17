export default function playAudio(greenLight: boolean) {
  if (greenLight) {
    var audio = new Audio("http://localhost:3000/greenlight.mp3");
    // let audio = new Audio("http://localhost:3000/koreangreen.mp3");
    audio.play();
  } else {
    let audio = new Audio("http://localhost:3000/redlight.mp3");
    audio.play();
  }
}
