# MediaPipe Holistic Landmarker as pipeline input

This note captures what you need to reuse **Google MediaPipe [Holistic Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/holistic_landmarker)** as the **single vision input** for future tools (generative plotters, interaction, etc.). It matches what the repo already does in `static/tools/mediapipe-vision-inspector.html`.

## 1. Package and WASM

- **NPM:** `@mediapipe/tasks-vision` (pin a version, e.g. `0.10.35`, across JS bundle and WASM URL).
- **Runtime entry:** `vision_bundle.mjs` (ESM) or the published CJS bundle.
- **WASM directory:** must be loadable at a URL whose folder contains the published `.wasm` + loader scripts. Typical CDN layout:

  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@<version>/wasm`

Resolve once and reuse for every task on the page:

```js
import { FilesetResolver, HolisticLandmarker } from "@mediapipe/tasks-vision";

const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
);
```

## 2. Model asset (`.task`)

Host or hotlink a **`.task`** bundle (not the old README typo that pointed at `hand_landmark.task`). Example used in this project:

```text
https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task
```

For reproducible builds, prefer a **versioned** path (`…/float16/1/…` or another fixed revision) instead of `latest` once you confirm it exists and works.

## 3. Creating the task (video / webcam)

Use **`runningMode: "VIDEO"`** and call **`detectForVideo(video, timestampMs)`** on each frame. The timestamp must be **monotonic** (e.g. `requestAnimationFrame` time or a strictly increasing frame clock).

```js
const holisticLandmarker = await HolisticLandmarker.createFromOptions(vision, {
  runningMode: "VIDEO",
  baseOptions: {
    modelAssetPath: HOLISTIC_MODEL_URL,
    delegate: "CPU", // see §5
  },
  outputFaceBlendshapes: false,      // optional; heavier JSON / tensors
  outputPoseSegmentationMasks: false, // optional; see §6
  // thresholds (defaults usually fine to start):
  // minFaceDetectionConfidence, minFaceSuppressionThreshold, minFacePresenceConfidence,
  // minPoseDetectionConfidence, minPoseSuppressionThreshold, minPosePresenceConfidence,
  // minHandLandmarksConfidence
});

// Per frame:
const result = holisticLandmarker.detectForVideo(videoElement, timestampMs);
```

Re-create the instance when you change options that affect the graph (e.g. toggling `outputPoseSegmentationMasks` or `outputFaceBlendshapes`), as in the inspector.

## 4. What you read as “input” for downstream logic

`HolisticLandmarkerResult` is the contract for generative code. Useful fields:

| Field | Role |
|--------|------|
| `faceLandmarks` | `NormalizedLandmark[][]` — one group per face; x,y ∈ [0,1] (z depth relative to face scale). |
| `faceBlendshapes` | Optional `Classifications[]` per face — only if `outputFaceBlendshapes: true`. |
| `poseLandmarks` | `NormalizedLandmark[][]` — image-space body keypoints. |
| `poseWorldLandmarks` | `Landmark[][]` — meters in a world frame; z “smaller = closer to camera”. |
| `leftHandLandmarks` / `rightHandLandmarks` | `NormalizedLandmark[][]` — hands split by side. |
| `leftHandWorldLandmarks` / `rightHandWorldLandmarks` | `Landmark[][]` — world coords when present. |
| `poseSegmentationMasks` | `MPMask[]` — only if `outputPoseSegmentationMasks: true`; see §6. |

**Topology for drawing or stroke graphs:** use the static connection lists on the class, e.g. `HolisticLandmarker.POSE_CONNECTIONS`, `HolisticLandmarker.HAND_CONNECTIONS`, and the `FACE_LANDMARKS_*` arrays (oval, contours, tesselation, etc.).

**Coordinate tip:** Normalized landmarks match the **unmirrored** video bitmap. If you mirror the preview with CSS `scaleX(-1)`, keep your math on the **raw frame** (or flip x as `1 - x`) so controls and exports stay consistent.

## 5. CPU vs GPU inference (`delegate`)

- **`delegate: "CPU"`** in `baseOptions` avoids needing a WebGL canvas **for inference** and sidesteps missing-GPU setups.
- **`delegate: "GPU"`** (or omitting CPU where the runtime defaults toward GPU) can require passing a **`canvas`** (WebGL2-capable `HTMLCanvasElement` or `OffscreenCanvas`) in the task options per `VisionTaskOptions` in the API.

For tooling in this repo, **CPU inference + separate WebGL only for masks** has been the practical split (see §6).

## 6. Segmentation masks and `DrawingUtils`

Pose segmentation returns **`MPMask`** objects. Compositing with **`DrawingUtils`** (e.g. `drawConfidenceMask`) expects a **`WebGL2RenderingContext`** as the **second** constructor argument when masks are GPU-backed:

```js
const drawUtils = new DrawingUtils(canvas2dContext, webgl2Context);
```

So: inference can stay CPU; **mask drawing** often still needs a small hidden **`webgl2`** canvas sized to the current frame dimensions. If WebGL2 is unavailable, skip mask drawing or implement a slower CPU path (category-style uint8 masks are easier than float confidence maps).

Inside callbacks, masks may be short-lived — copy or finish drawing before returning if you use the callback overloads.

## 7. Lifecycle and cleanup

- Call **`holisticLandmarker.close()`** when tearing down or hot-swapping models.
- If a result type exposes **`close()`** (e.g. some copied segmentation results), call it when switching frames; for holistic **pose masks**, close each **`MPMask`** when finished (see inspector `releaseHolisticMasks`).
- Call **`DrawingUtils.close()`** when disposing the helper.

## 8. Design choice: holistic vs stacked tasks

Holistic bundles **pose + face + hands** with consistent tracking assumptions. Prefer it when you want **one graph** and one timestamped result for full-body tooling.

Running **HolisticLandmarker** together with **PoseLandmarker + FaceLandmarker + HandLandmarker** on the same frame is redundant and costly; pick one pipeline per project unless you deliberately compare stability.

## 9. Environment

- Camera and model fetches need a **secure context** (HTTPS or `localhost`) for `getUserMedia` and for predictable cross-origin behavior.
- Pin **package + WASM + model** versions for anything you ship or plot reproducibly.

## 10. Reference in this repository

- **Working integration:** `static/tools/mediapipe-vision-inspector.html` — holistic toggle, `cpuModel()`, `ensureDrawingUtils()` (WebGL2 for masks), `detectForVideo`, and drawing via `HolisticLandmarker.*_CONNECTIONS`.

## 11. Official references

- [Holistic Landmarker overview](https://ai.google.dev/edge/mediapipe/solutions/vision/holistic_landmarker)
- [Web setup (WASM / tasks)](https://ai.google.dev/edge/mediapipe/solutions/setup_web)
- [JavaScript `@mediapipe/tasks-vision` API](https://ai.google.dev/edge/api/mediapipe/js/tasks-vision)
