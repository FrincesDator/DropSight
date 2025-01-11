export const calculateMortalityRate = (deaths, population) => {
  if (!isNaN(deaths) && !isNaN(population) && population > 0) {
    return ((deaths / population) * 100).toFixed(2);
  }
  return "No Input";
};
 
// Display Mortality Rate with Status
export const displayMortalityRate = (mortalityRateStr) => {
  if (mortalityRateStr === "No Input") {
    return mortalityRateStr;
  }
 
  const mortalityRate = Number(mortalityRateStr);
 
  if (mortalityRate <= 5) {
    return mortalityRate + "% - Normal";
  } else {
    return mortalityRate + "% - High";
  }
};
 
// Water intake thresholds per age
const waterIntakeThresholds = {
  0: [0.0059, 0.0118],
  1: [0.0059, 0.0118],
  2: [0.0118, 0.0177],
  3: [0.0177, 0.0237],
  4: [0.0237, 0.0296],
  5: [0.0296, 0.0355],
  6: [0.0355, 0.0414],
  7: [0.0414, 0.0473],
  8: [0.0473, 0.0532],
  9: [0.0532, 0.0591],
  10: [0.0591, 0.0650],
  11: [0.0650, 0.0709],
  12: [0.0709, 0.0768],
  13: [0.0768, 0.0827],
  14: [0.0827, 0.0887],
  15: [0.0887, 0.0946],
  16: [0.0946, 0.1005],
  17: [0.1005, 0.1064],
  18: [0.1064, 0.1123],
  19: [0.1123, 0.1182],
  20: [0.1182, 0.1241],
  21: [0.1241, 0.1300],
  22: [0.1300, 0.1359],
  23: [0.1359, 0.1419],
  24: [0.1419, 0.1478],
  25: [0.1478, 0.1537],
  26: [0.1537, 0.1596],
  27: [0.1596, 0.1655],
  28: [0.1655, 0.1714],
  29: [0.1714, 0.1773],
  30: [0.1773, 0.1832],
  31: [0.1832, 0.1891],
  32: [0.1891, 0.1951],
  33: [0.1951, 0.2010],
  34: [0.2010, 0.2069],
  35: [0.2069, 0.2128],
  36: [0.2128, 0.2187],
  37: [0.2187, 0.2246],
  38: [0.2246, 0.2305],
  39: [0.2305, 0.2364],
  40: [0.2364, 0.2423],
  41: [0.2423, 0.2483],
  42: [0.2483, 0.2542],
  43: [0.2542, 0.2601],
  44: [0.2601, 0.2660],
  45: [0.2660, 0.2719]
}
 
// Feed intake thresholds per age (in grams)
const feedIntakeThresholds = {
  0: [0.005, 0.02],
  1: [0.005, 0.02],
  8: [0.035, 0.5],
  15: [0.075, 0.90],
  22: [0.125, 0.140],
  29: [0.155, 0.17],
  36: [0.185, 0.200],
  43: [0.215, 0.230],
};
 
// Average weight thresholds per age (in pounds)
const averageWeightThresholds = {
    0: [0.026429, 0.052857],
    1: [0.026429, 0.052857],
    2: [0.052857, 0.079286],
    3: [0.072986, 0.105714],
    4: [0.105714, 0.132143],
    5: [0.132143, 0.158571],
    6: [0.158571, 0.185],
    7: [0.185, 0.251429],
    8: [0.251429, 0.317857],
    9: [0.317857, 0.384286],
    10: [0.384286, 0.450714],
    11: [0.450714, 0.517143],
    12: [0.517143, 0.583571],
    13: [0.583571, 0.65],
    14: [0.65, 0.784714],
    15: [0.784714, 0.0919429],
    16: [0.0919429, 1.054143],
    17: [1.054143, 1.188857],
    18: [1.188857, 1.323571],
    19: [1.323571, 1.458286],
    20: [1.458286, 1.593],
    21: [1.593, 1.810714],
    22: [1.810714, 2.028429],
    23: [2.028429, 2.246143],
    24: [2.246143, 2.463857],
    25: [2.463857, 2.681571],
    26: [2.681571, 2.899286],
    27: [2.899286, 3.117],
    28: [3.117, 3.43],
    29: [3.43, 3.743],
    30: [3.743, 4.056],
    31: [4.056, 4.369],
    32: [4.369, 4.682],
    33: [4.682, 4.995],
    34: [4.995, 5.308],
    35: [5.308, 5.716143],
    36: [5.716143, 6.124286],
    37: [6.124286, 6.532429],
    38: [6.532429, 6.940571],
    39: [6.940571, 7.348714],
    40: [7.348714, 7.756857],
    41: [7.756857, 8.165],
    42: [8.165, 8.665857],
    43: [8.665857, 9.166714],
    44: [9.166714, 9.667571],
    45: [9.667571, 10.16843],
};
 
// Display Water Intake with Status based on Age and Population
export const displayWaterIntake = (waterIntake, ageNumber, totalPopulation) => {
  if (isNaN(waterIntake) || isNaN(ageNumber) || totalPopulation <= 0) {
    return "Invalid Input";
  }
 
  const waterIntakeEach = (waterIntake / totalPopulation).toFixed(4);
  const [low, high] = waterIntakeThresholds[ageNumber] || [0, Infinity];
 
  if (waterIntakeEach < low) {
    return waterIntakeEach + " Litre/s - Low";
  } else if (waterIntakeEach >= low && waterIntakeEach <= high) {
    return waterIntakeEach + " Litre/s - Normal";
  } else {
    return waterIntakeEach + " Litre/s - High";
  }
};
 
// Display Feed Intake with Status based on Age and Population
export const displayFeedIntake = (feedIntake, ageNumber, totalPopulation) => {
  if (isNaN(feedIntake) || isNaN(ageNumber) || totalPopulation <= 0) {
    return "Invalid Input";
  }
 
  const feedIntakeEach = (feedIntake / totalPopulation).toFixed(4);
  const [low, high] = feedIntakeThresholds[ageNumber] || [0, Infinity];
 
  if (feedIntakeEach < low) {
    return feedIntakeEach + " Kilogram/s - Low";
  } else if (feedIntakeEach >= low && feedIntake <= high) {
    return feedIntakeEach + " Kilogram/s - Normal";
  } else {
    return feedIntakeEach + " Kilogram/s - High";
  }
};
 
// Display Average Weight with Status based on Age and Population
export const displayAverageWeight = (averageWeight, ageNumber, totalPopulation) => {
  if (isNaN(averageWeight) || isNaN(ageNumber) || totalPopulation <= 0) {
    return "Invalid Input";
  }
 
  // Fetch the correct range for the given age
  const thresholds = averageWeightThresholds[ageNumber];
  if (!thresholds) {
    return "Age not in thresholds";
  }
 
  const [low, high] = thresholds;
 
  // Compare the input averageWeight to the thresholds
  if (averageWeight < low) {
    return `${averageWeight} Kilogram/s - Underweight`;
  } else if (averageWeight >= low && averageWeight <= high) {
    return `${averageWeight} Kilogram/s - Normal`;
  } else {
    return `${averageWeight} Kilogram/s - Overweight`;
  }
};
 