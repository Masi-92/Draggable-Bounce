import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import "./BallComponent.css"; // Wir fügen einen CSS-Dateipfad hinzu

gsap.registerPlugin(Draggable, InertiaPlugin);

const BallComponent = () => {
  const ballRef = useRef(null);
  const [vw, setVw] = useState(window.innerWidth);
  const [vh, setVh] = useState(window.innerHeight);
  const [radius, setRadius] = useState(0);
  const friction = -0.5;

  useEffect(() => {
    const ball = ballRef.current;
    const ballProps = gsap.getProperty(ball);
    const tracker = InertiaPlugin.track(ball, "x,y")[0];

    setRadius(ball.getBoundingClientRect().width / 2);

    // Set initial position and animation defaults
    gsap.defaults({
      overwrite: true
    });

    gsap.set(ball, {
      xPercent: -50,
      yPercent: -50,
      x: vw / 2,
      y: vh / 2
    });

    const draggable = new Draggable(ball, {
      bounds: window,
      onPress() {
        gsap.killTweensOf(ball);
        this.update();
      },
      onDragEnd() {
        animateBounce();
      }
    });

    // Function to animate the ball bounce with inertia
    const animateBounce = (x = "+=0", y = "+=0", vx = "auto", vy = "auto") => {
      gsap.fromTo(
        ball,
        { x, y },
        {
          inertia: {
            x: vx,
            y: vy
          },
          onUpdate: checkBounds
        }
      );
    };

    // Function to check the boundaries and apply bounce logic
    const checkBounds = () => {
      let r = radius;
      let x = ballProps("x");
      let y = ballProps("y");
      let vx = tracker.get("x");
      let vy = tracker.get("y");
      let xPos = x;
      let yPos = y;
      let hitting = false;

      if (x + r > vw) {
        xPos = vw - r;
        vx *= friction;
        hitting = true;
      } else if (x - r < 0) {
        xPos = r;
        vx *= friction;
        hitting = true;
      }

      if (y + r > vh) {
        yPos = vh - r;
        vy *= friction;
        hitting = true;
      } else if (y - r < 0) {
        yPos = r;
        vy *= friction;
        hitting = true;
      }

      if (hitting) {
        animateBounce(xPos, yPos, vx, vy);
      }
    };

    const handleResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      draggable.kill();
    };
  }, [vw, vh, radius, friction]);

  return <div ref={ballRef} className="ball"></div>;
};

export default BallComponent;
