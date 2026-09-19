"use client";

import { useState } from "react";
import IntroScene from "@/components/IntroScene";

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  return (
    <>
      {!done && <IntroScene onDone={() => setDone(true)} />}
      <div style={{ opacity: done ? 1 : 0, transition: "opacity 0.5s ease" }}>
        {children}
      </div>
    </>
  );
}
