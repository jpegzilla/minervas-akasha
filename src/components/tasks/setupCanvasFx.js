const vertexShaderText = `precision mediump float;

attribute vec2 vertPosition;

void main()
{
  gl_Position = vec4(vertPosition, 0.0, 1.0);
}`;

const fragmentShaderText = `precision mediump float;

void main()
{
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

class webglContext {
  constructor(canvasRefCurrent) {
    try {
      const canvas = canvasRefCurrent;

      this.gl = canvas.getContext("webgl");

      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

      this.gl.shaderSource(vertexShader, vertexShaderText);
      this.gl.shaderSource(fragmentShader, fragmentShaderText);

      this.gl.compileShader(vertexShader);
      this.gl.compileShader(fragmentShader);

      const program = this.gl.createProgram();

      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);

      this.gl.linkProgram(program);

      this.gl.validateProgram(program);

      const triangleVertices = [0.0, 0.5, -0.5, -0.5, 0.5, -0.5];
      const triangleVertexBufferObject = this.gl.createBuffer(
        this.gl.ARRAY_BUFFER,
        triangleVertexBufferObject
      );

      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(triangleVertices),
        this.gl.STATIC_DRAW
      );

      const positionAttribLocation = this.gl.getAttribLocation(
        program,
        "vertPosition"
      );

      this.gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        this.gl.FLOAT,
        this.gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
      );

      this.gl.enableVertexAttribArray(positionAttribLocation);

      this.gl.useProgram(program);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    } catch (err) {
      console.info(err);
    }
  }
}

// particle effects

const random = (min, max) => {
  return Math.random() * (max - min) + min;
};

export class ParticleGenerator {
  constructor() {
    this.particles = [];
  }

  init(canvasRefCurrent, max = 300) {
    this.canvas = canvasRefCurrent;
    this.context = this.canvas.getContext("2d");
    this.maxParticleCount = max;
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
  }
  snow(ctx) {
    const particle = {
      x: random(0, this.canvas.width),
      y: random(0, this.canvas.height),
      xvel: random(-1, 1),
      yvel: random(-1, 1),
      size: random(1, 2),
      alpha: 1,
      color: `rgba(${random(200, 255)}, ${random(200, 255)}, ${random(
        200,
        255
      )}, 1)`
    };

    this.particles.push(particle);

    // delete excess particles
    if (this.particles.length > this.maxParticleCount) this.particles.shift();

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      ctx.fillStyle = p.color;

      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.x += p.xvel;
      p.y += p.yvel;
      p.alpha -= 0.005;

      p.color = `rgba(${random(200, 255)}, ${random(200, 255)}, ${random(
        200,
        255
      )}, ${p.alpha})`;
    });

    requestAnimationFrame(() => this.snow(ctx));
  }
}
