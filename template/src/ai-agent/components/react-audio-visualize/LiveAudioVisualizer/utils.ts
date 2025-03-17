interface CustomCanvasRenderingContext2D extends CanvasRenderingContext2D {
  roundRect: (
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
  ) => void;
}

export const calculateBarData = (
  frequencyData: Uint8Array,
  width: number,
  barWidth: number,
  gap: number,
): number[] => {
  let units = width / (barWidth + gap);
  let step = Math.floor(frequencyData.length / units);

  if (units > frequencyData.length) {
    units = frequencyData.length;
    step = 1;
  }

  const data: number[] = [];

  for (let i = 0; i < units; i++) {
    let sum = 0;

    for (let j = 0; j < step && i * step + j < frequencyData.length; j++) {
      sum += frequencyData[i * step + j];
    }
    data.push(sum / step);
  }
  return data;
};

export const draw = (
  data: number[],
  canvas: HTMLCanvasElement,
  barWidth: number,
  gap: number,
  backgroundColor: string,
  barColor: string,
): void => {
  const amp = canvas.height / 2;

  const ctx = canvas.getContext('2d') as CustomCanvasRenderingContext2D;
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // const sampled = data.slice(0, 8);
  //
  // const downSampled = new Array(5).fill(0);
  //
  // const downPoint = Math.floor(sampled.length / 5);
  //
  // sampled.forEach((dp, i) => {
  // 	downSampled[Math.floor(i / downPoint)] += dp;
  // });

  // const sampled = new Array(Math.ceil(data.length / 5)).fill(0);

  // for (const dataPoint of data) {
  // 	const index = Math.floor(dataPoint / 5);
  // 	sampled[index] += dataPoint;
  // }

  const displayData = data.slice(0, 5);

  const newBarWidth =
    (canvas.width - gap * (displayData.length - 1)) / displayData.length;

  const minHeight = newBarWidth;

  displayData.forEach((dpo, i) => {
    const dp = dpo;

    ctx.fillStyle = barColor;

    const x = i * (newBarWidth + gap);
    const y = amp - dp / 2;
    const w = newBarWidth;
    const h = dp || 1;

    ctx.beginPath();
    if (ctx.roundRect) {
      // making sure roundRect is supported by the browser
      ctx.roundRect(x, y - minHeight / 2, w, h + minHeight, w / 2);
      ctx.fill();
    } else {
      // fallback for browsers that do not support roundRect
      ctx.fillRect(x, y, w, h);
    }
  });
};
