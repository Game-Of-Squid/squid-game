import { useEffect } from "react";
import { useState } from "react";
import initializeCamera from "../lib/camera";
import { useNavigate } from "react-router";
import { initKeys, onKey } from "kontra";
import playAudio from "../lib/audio";

import game from "../Game";
import { MS_TO_SNAPSHOT } from "../constants";

const logo = require("../assets/images/squidgamelogo.png");

const Game: React.FC = () => {
  const [isGreen, setIsGreen] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    game.initialized = true;

    initKeys(); // initalize keyboard input
    initializeCamera();
    game.init();

    return () => {
      game.initialized = false;
    };
  }, []);

  const switchColour = () => {
    if (!isStarted) return;

    setIsGreen(!isGreen);
    game.greenLight = !game.greenLight;
    game.snapshot = {};

    if (!game.greenLight) {
      // if the light is red
      // take a snapshot of all the poses

      setTimeout(() => {
        game.takeSnapshot();
      }, MS_TO_SNAPSHOT);
    }

    playAudio(game.greenLight);
  };

  onKey(
    "space",
    () => {
      switchColour();
    },
    { preventDefault: true, handler: "keyup" }
  );

  const startGame = () => {
    setIsStarted(!isStarted);

    if (!isStarted) {
      playAudio(game.greenLight);
    } else {
      // TODO: stop the game
      game.reset();
      setIsGreen(true);
    }
  };

  return (
    <div className="game" style={{ backgroundColor: isStarted ? (isGreen ? "green" : "red") : "#132228" }}>
      <img id="logo" src={logo} style={{ width: 100, position: "absolute", left: 10, top: 10 }} onClick={() => navigate("/")} alt="" />

      <h1>Game In Action</h1>
      <div className="video">
        <canvas id="canvas" width="500" height="500" style={{ position: "absolute", zIndex: 1 }}></canvas>
        <video autoPlay id="video" style={{ width: "600px", height: "480px", transform: "rotateY(180deg)", position: "absolute" }} />
      </div>
      <div id="button-container" style={{ width: "500px" }}>
        <button onClick={startGame} className="play-button">
          {isStarted ? "Stop Game" : "Start Game"}
        </button>
        {isStarted && (
          <button onClick={switchColour} className="play-button">
            Switch Color (Spacebar)
          </button>
        )}

        <button
          onClick={() => {
            game.sendTest();
          }}
          className="play-button">
          Test
        </button>
      </div>
    </div>
  );
};

export default Game;
