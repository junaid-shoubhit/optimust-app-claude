const bodyPartDetails = {
    head: ["Head", "Neck"],
    left_shoulder: 1,
    right_shoulder: 1,
    chest: ["Chest", "Upper Back"],
    left_arm: ["Arm", "Elbow", "Wrist"],
    right_arm: ["Arm", "Elbow", "Wrist"],
    left_hand: ["Finger_Left1", "Finger_Left2", "Finger_Left3", "Finger_Left4", "Finger_Left5"],
    right_hand: ["Finger_Right1", "Finger_Right2", "Finger_Right3", "Finger_Right4", "Finger_Right5"],
    stomach: [  "Lower Back","Abdomen",],
    right_leg: ["HipPelvic_Right", "Thigh", "Knee", "Ankle"],
    left_leg: ["HipPelvic_Left", "Thigh", "Knee", "Ankle"],
    left_foot: ["Toe_Left1", "Toe_Left2", "Toe_Left3", "Toe_Left4", "Toe_Left5"],
    right_foot: ["Toe_Right1", "Toe_Right2", "Toe_Right3", "Toe_Right4", "Toe_Right5"],
};

export const defaultPartsInput = Object.fromEntries(
    Object.entries(bodyPartDetails).map(([part, subParts]) => [
        part,
        {
            show: true,
            selected: false,
            subParts,
            selectedSubParts: [],
        },
    ])
);

export const API_TO_UI_INJURY_MAP = {
  Head: { part: "head", sub: "Head" },
  Neck: { part: "head", sub: "Neck" },

  UpperBack: { part: "chest", sub: "Upper Back" },
  Chest: { part: "chest", sub: "Chest" },
  LowerBack: { part: "stomach", sub: "Lower Back" },
  Abdomen: { part: "stomach", sub: "Abdomen" },

  Shoulder_Left: { part: "left_shoulder" },
  Shoulder_Right: { part: "right_shoulder" },

  Arm_Left: { part: "left_arm", sub: "Arm" },
  Elbow_Left: { part: "left_arm", sub: "Elbow" },
  Wrist_Left: { part: "left_arm", sub: "Wrist" },

  Arm_Right: { part: "right_arm", sub: "Arm" },
  Elbow_Right: { part: "right_arm", sub: "Elbow" },
  Wrist_Right: { part: "right_arm", sub: "Wrist" },

  HipPelvic_Left: { part: "left_leg", sub: "HipPelvic_Left" },
  Thigh_Left: { part: "left_leg", sub: "Thigh" },
  Knee_Left: { part: "left_leg", sub: "Knee" },
  Ankle_Left: { part: "left_leg", sub: "Ankle" },

  HipPelvic_Right: { part: "right_leg", sub: "HipPelvic_Right" },
  Thigh_Right: { part: "right_leg", sub: "Thigh" },
  Knee_Right: { part: "right_leg", sub: "Knee" },
  Ankle_Right: { part: "right_leg", sub: "Ankle" },

  Finger_Left1: { part: "left_hand", sub: "Finger_Left1" },
  Finger_Left2: { part: "left_hand", sub: "Finger_Left2" },
  Finger_Left3: { part: "left_hand", sub: "Finger_Left3" },
  Finger_Left4: { part: "left_hand", sub: "Finger_Left4" },
  Finger_Left5: { part: "left_hand", sub: "Finger_Left5" },
  Finger_Right1: { part: "right_hand", sub: "Finger_Right1" },
  Finger_Right2: { part: "right_hand", sub: "Finger_Right2" },
  Finger_Right3: { part: "right_hand", sub: "Finger_Right3" },
  Finger_Right4: { part: "right_hand", sub: "Finger_Right4" },
  Finger_Right5: { part: "right_hand", sub: "Finger_Right5" },

  Toe_Left1: { part: "left_foot", sub: "Toe_Left1" },
  Toe_Left2: { part: "left_foot", sub: "Toe_Left2" },
  Toe_Left3: { part: "left_foot", sub: "Toe_Left3" },
  Toe_Left4: { part: "left_foot", sub: "Toe_Left4" },
  Toe_Left5: { part: "left_foot", sub: "Toe_Left5" },

  Toe_Right1: { part: "right_foot", sub: "Toe_Right1" },
  Toe_Right2: { part: "right_foot", sub: "Toe_Right2" },
  Toe_Right3: { part: "right_foot", sub: "Toe_Right3" },
  Toe_Right4: { part: "right_foot", sub: "Toe_Right4" },
  Toe_Right5: { part: "right_foot", sub: "Toe_Right5" },
};

export function mapApiInjuriesToPartsInput(client) {
  const parts = JSON.parse(JSON.stringify(defaultPartsInput));

  Object.entries(API_TO_UI_INJURY_MAP).forEach(([apiField, config]) => {
    if (client[apiField] === true) {
      const { part, sub } = config;

      if (!parts[part]) return;

      // no sub-parts (like shoulder)
      if (!sub) {
        parts[part].selected = true;
        return;
      }

      if (!parts[part].selectedSubParts.includes(sub)) {
        parts[part].selectedSubParts.push(sub);
      }

      parts[part].selected = true;
    }
  });

  return parts;
}

export const formatInjuryLabel = (text) => {
  if (!text) return text;

  return text
    // replace underscores with space
    .replace(/_/g, " ")
    // split camel case (HipPelvic → Hip Pelvic)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // move Left/Right to front for better UX
    .replace(/(Finger|Toe|Hip Pelvic|Arm|Elbow|Wrist|Ankle|Knee|Thigh) (Left|Right)/i, "$2 $1")
    // capitalize words
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};