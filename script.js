let video = document.getElementById("video");
let model;
// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");
let windowHeight = window.outerHeight * 0.4;
let windowWidth = window.outerWidth - 100;
var fps = 30;

var thresholdRightKneeAndHipDownDistance = 20;
var thresholdRightKneeAndHipUpDistance = 30;

var targetCount = 10;
var isDynamicDistanceSet = false;
// alert(windowWidth)
// alert(document.getElementsByClassName("test").offsetWidth);
// alert(window.outerWidth);

// var thresholdAngle = 130;

// var rightHandCount = 0;
// var canBeProceedForRightCount = true;
// var hasRightCountIncreasedOnce = false;

// var leftHandCount = 0;
// var canBeProceedForLeftCount = true;
// var hasLeftCountIncreasedOnce = false;

// var isGoalAchieved = false;
// var goalCount = 5;
const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
};

// Hacks for Mobile Safari
video.setAttribute("playsinline", true);
video.setAttribute("controls", true);
setTimeout(() => {
  video.removeAttribute("controls");
});

// var upValue = 150;
// var downValue = 130;

// var threshHoldKneeAnkleDistance = 30;
let detector;

var canCountIncrease = false;
var countValue = 0;

const setupCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: windowWidth, height: windowHeight },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
      // document.getElementById("goalCount").innerHTML = goalCount;
    });
};

const detectPose = async () => {
  // alert(document.getElementById("video").offsetWidth)
  const poses = await detector.estimatePoses(document.querySelector("video"));

  // const predictions = await model.estimateHands(document.querySelector("video"));
  console.log(poses);

  // temporary area
  if (poses.length) {
    let left_hip = poses[0].keypoints.find((x) => x.name == "left_hip");
    let left_knee = poses[0].keypoints.find((x) => x.name == "left_knee");

    let right_hip = poses[0].keypoints.find((x) => x.name == "right_hip");
    let right_knee = poses[0].keypoints.find((x) => x.name == "right_knee");

    if (
      left_hip.score > 0.5 &&
      left_knee.score > 0.5 &&
      right_knee.score > 0.5 &&
      right_hip.score > 0.5
    ) {
      document.getElementById("message").innerHTML =
        "We are good to count Squats now ";

      document.getElementById("video").style.borderColor = "green";

      var rightKneeAndHipDistance = distanceBetweenTwo(
        right_knee.x,
        right_hip.x,
        right_knee.y,
        right_hip.y
      );

      document.getElementById("upVal").innerHTML =
        thresholdRightKneeAndHipUpDistance - 5;
      document.getElementById(
        "downVal"
      ).innerHTML = thresholdRightKneeAndHipDownDistance;
      document.getElementById("current").innerHTML = rightKneeAndHipDistance;


      if(rightKneeAndHipDistance <  thresholdRightKneeAndHipUpDistance - 5){
        document.getElementById("message").innerHTML = ' will work';

      }else{
        document.getElementById("message").innerHTML = ' Not work';

      }

      //test for dynamic height
      if (!isDynamicDistanceSet) {
        setTimeout(()=>{
          thresholdRightKneeAndHipUpDistance = rightKneeAndHipDistance -5 ;
          thresholdRightKneeAndHipDownDistance = rightKneeAndHipDistance - 10;     
        },1500)
        isDynamicDistanceSet = true;    
      }

      //

      // var rightKneeAndAnkleDistance = distanceBetweenTwo(
      //   right_knee.x,
      //   right_ankle.x,
      //   right_knee.y,
      //   right_ankle.y
      // );

      // document.getElementById(
      //   "rightKneeAndHipDistance"
      // ).innerHTML = rightKneeAndHipDistance;

      if (rightKneeAndHipDistance > thresholdRightKneeAndHipUpDistance) {
        canCountIncrease = true;
      }
      if (
        rightKneeAndHipDistance <= thresholdRightKneeAndHipDownDistance &&
        canCountIncrease
      ) {
        countValue = countValue + 1;
        canCountIncrease = false;

        document.getElementById("countValue").innerHTML = countValue;

        if (countValue >= targetCount) {
          document.getElementById("targetAchievedMessage").innerHTML =
            "🎇 Target Achieved 🎇";
          console.log(true);
        }
      }
    } else {
      document.getElementById("message").innerHTML =
        "We are not able to see your whole body";

      document.getElementById("video").style.borderColor = "red";
    }
  }

  // ctx.drawImage(video, 0, 0, windowWidth, windowHeight);

  // poses.forEach((eachPose) => {
  //   ctx.beginPath();
  //   ctx.lineWidth = "4";
  //   ctx.strokeStyle = "blue";

  //   ctx.fillStyle = "red";
  //   eachPose.keypoints.forEach((key, index) => {
  //     ctx.fillRect(key.x, key.y, 5, 5);

  //   });

  //   ctx.stroke();
  // });
};

setupCamera();
video.addEventListener("loadeddata", async () => {
  // document.getElementById("video").offsetWidth, document.getElementById("video").offsetHeight

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.get("goal")) {
    targetCount = urlParams.get("goal");
  }
  document.getElementById("targetCount").innerHTML = targetCount;

  console.log("queryString", targetCount);

  // canvas.width = document.getElementById("video").offsetWidth;
  // canvas.height = document.getElementById("video").offsetHeight;
  // canvas.setAttribute("width", windowWidth);
  // canvas.setAttribute("height", windowHeight);
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );

  document.getElementById("loadingText").innerHTML =
    "Please stand in front of camera";

  // document.getElementById("upscoreThreshold").innerHTML =upValue;
  // document.getElementById("downscoreThreshold").innerHTML =downValue;

  setInterval(detectPose, fps);
});

function sendMessagetoFlutter(value) {
  console.log(value);
  // window.CHANNEL_NAME.postMessage('Hello from JS');
}

function distanceBetweenTwo(x2, x1, y2, y1) {
  var a = x2 - x1;
  var b = y2 - y1;

  return Math.sqrt(a * a + b * b);
}
