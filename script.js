let video = document.getElementById("video");
let model;
// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");
let windowHeight = window.outerHeight * 0.4;
let windowWidth = window.outerWidth - 100;

var targetCount = 10;
const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
};

// Hacks for Mobile Safari
video.setAttribute("playsinline", true);
video.setAttribute("controls", true);
setTimeout(() => {
  video.removeAttribute("controls");
});

var tiles_now = 0;
var tiles_previous = 0;
var person_height = 0;
var isHeightAssignedInitially = false;
var isHeightChangeRequired = false;
var thresholdSit = 0;
var initialTime = new Date();
var currentTime = new Date();
var positionLocked = false;
var bFirst = false;
var upValue = 150;
var downValue = 130;
var isInframeFirstTime = false;

var threshHoldKneeAnkleDistance = 30;
let detector;

var canCountIncrease = true;
var countValue = 0;

// background color
backgroundColor= '#b3cef6',

// progress bar color
progressColor='#4b86db',

// percentage data to present
// 75 = 75%
percent= 5,

// animation speed
duration= 2000

const setupCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: windowWidth, height: windowHeight },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
      // document.getElementById("targetCount").innerHTML = targetCount;
    });
};

const detectPose = async () => {
  // alert(document.getElementById("video").offsetWidth)
  const poses = await detector.estimatePoses(document.querySelector("video"));

  // const predictions = await model.estimateHands(document.querySelector("video"));
  console.log(poses);

  if (poses.length) {
    let right_shoulder = poses[0].keypoints.find(
      (x) => x.name == "right_shoulder"
    );
    let right_wrist = poses[0].keypoints.find((x) => x.name == "right_wrist");

    let right_knee = poses[0].keypoints.find((x) => x.name == "right_knee");
    let right_ankle = poses[0].keypoints.find((x) => x.name == "right_ankle");

    if (
      right_shoulder.score > 0.5 &&
      right_wrist.score > 0.5 &&
      right_knee.score > 0.5 &&
      right_ankle.score > 0.5
    ) {
      // document.getElementById("video").style.borderColor = "blue";
      if (!isInframeFirstTime) {
        document.getElementById("Ready").innerHTML =
          "Plz. hold on!! We are Calibrating";
        isInframeFirstTime = true;

        
        document.getElementById("overlaytext").innerHTML =
          "Stand Still";
      }

      var rightShoulderToAnkleDistance = distanceBetweenTwo(
        right_shoulder.x,
        right_ankle.x,
        right_shoulder.y,
        right_ankle.y
      );
      // document.getElementById(
      //   "rightShoulderToAnkleDistance"
      // ).innerHTML = rightShoulderToAnkleDistance;

      // console.log('initialTime',initialTime)
      // console.log('currentTime',currentTime)
      var secondDifference = Math.round(
        (currentTime.getTime() - initialTime.getTime()) / 1000
      );
      if (secondDifference > 3) {
        console.log("Greater than 3 seconds");
        // document.getElementById("video").style.borderColor = "blue";

        var diff = Math.abs(tiles_now - tiles_previous);
        if (diff < 1 && !bFirst) {
          console.log("positionLocked", positionLocked);

          positionLocked = true;
          bFirst = true;
          person_height = rightShoulderToAnkleDistance;
          document.getElementById("Ready").innerHTML =
            "All set!! Do not move untill the Squat is complete";
            off()
          // document.getElementById(
          //   "isPositionLocked"
          // ).innerHTML = positionLocked;

          document.getElementById("video").style.borderColor = "green";
        } else {
          tiles_previous = tiles_now;
        }
        initialTime = currentTime;
      } else {
        currentTime = new Date();
        tiles_now = (257.57 - rightShoulderToAnkleDistance) / 16.036;
      }

      if (person_height / rightShoulderToAnkleDistance > 1.3) {
        if (canCountIncrease) {
          countValue = countValue + 1;
          canCountIncrease = false;
          document.getElementById("countValue").innerHTML = countValue;

          var percentageCompleted = (countValue/ targetCount) * 100
          changePercentage(percentageCompleted)

          if (countValue >= targetCount) {
            sendMessagetoFlutter(true);
          }

    
        }
      }

      if (
        !canCountIncrease &&
        rightShoulderToAnkleDistance > person_height - 30
      ) {
        canCountIncrease = true;
      }
    } else {
      // document.getElementById("video").style.borderColor = "red";
      // console.log('red')

    }
  }
};

// rough
// if tile count is not changing don't change height

start = 100;
sitting = 100 / 1.4;

setupCamera();
video.addEventListener("loadeddata", async () => {
  // document.getElementById("video").offsetWidth, document.getElementById("video").offsetHeight

  // document.getElementById("isPositionLocked").innerHTML = positionLocked;
  // document.getElementById("initialTime").innerHTML = initialTime;

  $(".progress-bar").loading();


  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.get("goal")) {
    targetCount = urlParams.get("goal");
  }
  document.getElementById("targetCount").innerHTML = targetCount;

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );

  document.getElementById("loadingText").innerHTML =
    "Please stand in front of camera where whole body is visible";

  setInterval(detectPose, 30);
  on()
  document.getElementById("overlaytext").innerHTML =
    "Detecting";
  
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
function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

function changePercentage(vp){
  // percent =90;
  // document.querySelector('.progress-bar').dataset.percentage = 90;

  // // $("#chart").attr("data-percent", percent.toString());
  // console.log('percent changed', percent)

  var val = parseInt(vp);
  var $circle = $('#svg #bar');
  
  if (isNaN(val)) {
   val = 100; 
  }
  else{
    var r = $circle.attr('r');
    var c = Math.PI*(r*2);
   
    if (val < 0) { val = 0;}
    if (val > 100) { val = 100;}
    
    var pct = ((100-val)/100)*c;
    
    $circle.css({ strokeDashoffset: pct});
    
    $('#cont').attr('data-pct',val);
  }
}
