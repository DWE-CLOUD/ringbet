'use client';

import { useEffect } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { RINGS_ABI, RINGS_CONTRACT_ADDRESS } from '@/lib/contracts/abi';

interface RingEventsProps {
  onRingCreated?: (ringId: bigint, buyIn: bigint, maxPlayers: bigint) => void;
  onPlayerJoined?: (ringId: bigint, player: string) => void;
  onWinnerDeclared?: (ringId: bigint, winner: string, prize: bigint) => void;
}

export function RingEvents({ 
  onRingCreated, 
  onPlayerJoined, 
  onWinnerDeclared 
}: RingEventsProps) {
  
  // Watch for RingCreated events
  useWatchContractEvent({
    address: RINGS_CONTRACT_ADDRESS,
    abi: RINGS_ABI,
    eventName: 'RingCreated',
    onLogs(logs) {
      logs.forEach(log => {
        const args = log.args as any;
        if (onRingCreated && args) {
          onRingCreated(args.ringId, args.buyIn, args.maxPlayers);
        }
      });
    },
  });

  // Watch for PlayerJoined events
  useWatchContractEvent({
    address: RINGS_CONTRACT_ADDRESS,
    abi: RINGS_ABI,
    eventName: 'PlayerJoined',
    onLogs(logs) {
      logs.forEach(log => {
        const args = log.args as any;
        if (onPlayerJoined && args) {
          onPlayerJoined(args.ringId, args.player);
        }
      });
    },
  });

  // Watch for WinnerDeclared events
  useWatchContractEvent({
    address: RINGS_CONTRACT_ADDRESS,
    abi: RINGS_ABI,
    eventName: 'WinnerDeclared',
    onLogs(logs) {
      logs.forEach(log => {
        const args = log.args as any;
        if (onWinnerDeclared && args) {
          onWinnerDeclared(args.ringId, args.winner, args.prize);
        }
      });
    },
  });

  return null;
}
