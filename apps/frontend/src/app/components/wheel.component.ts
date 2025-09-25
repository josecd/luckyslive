import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-wheel',
  template: `
    <mat-card>
      <mat-card-title>SpinLive Wheel</mat-card-title>
      <canvas #canvas width="400" height="400"></canvas>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="manualSpin()">Spin</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    canvas {
      border: 1px solid #ccc;
      margin: 10px;
    }
  `]
})
export class WheelComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private socket!: Socket;
  private ctx!: CanvasRenderingContext2D;
  private segments = [
    { label: 'Prize 1', color: '#ff0000', probability: 0.2 },
    { label: 'Prize 2', color: '#00ff00', probability: 0.3 },
    { label: 'Prize 3', color: '#0000ff', probability: 0.5 }
  ];
  private angle = 0;
  private spinning = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.socket = io('http://localhost:3000');
    this.socket.on('spin', () => this.spin());
    this.socket.on('spinResult', (result: string) => this.showResult(result));
    this.drawWheel();
  }

  private drawWheel() {
    const centerX = 200;
    const centerY = 200;
    const radius = 150;
    let startAngle = 0;
    this.segments.forEach(segment => {
      const sliceAngle = segment.probability * 2 * Math.PI;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      this.ctx.lineTo(centerX, centerY);
      this.ctx.fillStyle = segment.color;
      this.ctx.fill();
      this.ctx.stroke();
      const labelAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius / 2);
      const labelY = centerY + Math.sin(labelAngle) * (radius / 2);
      this.ctx.fillStyle = '#000';
      this.ctx.fillText(segment.label, labelX, labelY);
      startAngle += sliceAngle;
    });
  }

  private spin() {
    if (this.spinning) return;
    this.spinning = true;
    const spinAngle = Math.random() * 360 + 720;
    const duration = 3000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      if (progress < 1) {
        this.angle = spinAngle * this.easeOut(progress);
        this.drawWheelRotated();
        requestAnimationFrame(animate);
      } else {
        this.spinning = false;
        const resultIndex = Math.floor((this.angle % 360) / (360 / this.segments.length));
        this.showResult(this.segments[resultIndex].label);
      }
    };
    animate();
  }

  private drawWheelRotated() {
    this.ctx.clearRect(0, 0, 400, 400);
    this.ctx.save();
    this.ctx.translate(200, 200);
    this.ctx.rotate((this.angle * Math.PI) / 180);
    this.ctx.translate(-200, -200);
    this.drawWheel();
    this.ctx.restore();
  }

  private easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private showResult(result: string) {
    alert(`Result: ${result}`);
  }

  manualSpin() {
    this.http.post('http://localhost:3000/wheels/trigger-spin', {}).subscribe((res: any) => {
      this.spin();
    });
  }
}