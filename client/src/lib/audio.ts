export default function playAudio(greenLight: boolean) {
  if (greenLight) {
    var audio = new Audio("http://localhost:3000/greenlightenglish.mp3");
    // let audio = new Audio("http://localhost:3000/koreangreen.mp3");
    audio.play();
  } else {
    let audio = new Audio("http://localhost:3000/redlightenglish.mp3");
    audio.play();
  }
}
