/**
* Helper function to sort an array of objects by chosen key
*/
export const sort = (arr, key, ignoreThe) => {
  try {
      arr.sort(function(a, b) {
        if (key) {
          a = a[key];
          b = b[key];
        }

        if (ignoreThe) {
          a = noThe(a);
          b = noThe(b);
        }

        if (a.toLowerCase() < b.toLowerCase()) {
          return -1;
        }

        if (a.toLowerCase() > b.toLowerCase()) {
          return 1;
        }

        return 0;
      });

      return arr;

  } catch (err) {
    console.log('sort failed', arr, key);
  }
}

const noThe = (str) => {
  if (typeof str === 'string') {
    const pieces = str.split(' ');
    
    if (pieces.length) {
      if (pieces[0].toLowerCase() === 'the') {
        pieces.shift();
        return pieces.join(' ');
      }
    }
  }

  return str;
}

/**
* Group a list of song objects by the first letter of each title
*/
export const alphaGroup = (arr, key, ignoreThe) => {
  // first sort
  sort(arr, key, ignoreThe);

  const items = arr.reduce((acc, cur) => {
    let firstLetter = key ? cur[key][0] : cur[0];

    if (Number.isInteger(parseInt(firstLetter, 10))) {
        firstLetter = '#';
    }

    firstLetter = firstLetter.toUpperCase();

    return { ...acc, [firstLetter]: [...(acc[firstLetter] || []), cur] };
  }, {});

  const grouped = Object.keys(items).map((letter) => {
    return {
      letter: letter,
      items: items[letter]
    }
  });

  return grouped;
}

// audio player uses this to format time in seconds as 00:00:00
export const formatTime = (seconds) => {
  seconds = parseInt(seconds, 10);

  if (isNaN(seconds)) {
    return '';
  }

  let time = [];
  const hours = Math.floor(seconds / 60 / 60);
  const minutes = Math.floor((seconds / 60) % 60);
  seconds = Math.floor(seconds % 60);

  if (hours) {
    time.push(hours);
  }

  if (hours && minutes < 10) {
    time.push('0'+ minutes);

  } else {
    time.push(minutes);
  }

  if (seconds < 10) {
    time.push('0'+ seconds);

  } else {
    time.push(seconds);
  }

  return time.join(':');
}

export const getMobileOS = () => {
  const ua = navigator.userAgent;

  if (/android/i.test(ua)) {
    return 'Android';

  } else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'iOS';
  }

  return false;
}