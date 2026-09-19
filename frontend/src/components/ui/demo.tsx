"use client";

import React from "react";
import ScrollMorphHero from "./scroll-morph-hero";

export default function Demo() {
    return (
        <div className="w-full h-[800px] border border-zinc-800 rounded-2xl overflow-hidden relative bg-black">
            <ScrollMorphHero />
        </div>
    );
}

export { Demo };
