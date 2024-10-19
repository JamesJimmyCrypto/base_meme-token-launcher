"use client";

import Navbar from "@/components/Navbar/Navbar";
import { WavyBackground } from "@/components/ui/wavy-background";
import Link from "next/link";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="container mx-auto hero-main h-full">
          <WavyBackground>
            <div className="flex h-full items-center">
              <div className="max-w-3xl mx-auto text-center text-white">
                <h1 style={{
                  fontFamily: "Poppins",
                }} className="text-7xl mb-3">MEME-LAUNCHER</h1>
                <p className="mb-3">
                  MEME-LAUNCHER simplifies ERC20 token creation on Base Sepolia Network build for Base Africa Builderton,
                  offering customizable tokens and a DeFi that reducing costs and technical barriers.
                </p>
                <Link href="/createtoken" className="button button-primary">
                  GET STARTED
                </Link>
              </div>
            </div>
          </WavyBackground>
        </div>
      </div>
    </>
  );
};

export default Home;
