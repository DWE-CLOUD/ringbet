import { useEffect, useState } from 'react';
import { useReadContract, useWatchContractEvent, usePublicClient } from 'wagmi';
import { RINGS_ABI, RINGS_CONTRACT_ADDRESS } from '@/lib/contracts/abi';
import { formatEther } from 'viem';

export interface RingData {
  id: number;
  buyIn: string;
  maxPlayers: number;
  participants: string[];
  isActive: boolean;
  totalPot: string;
}

export function useRings() {
  const [rings, setRings] = useState<RingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  // Get the next ring ID (total number of rings)
  const { data: nextRingId, refetch: refetchNextRingId } = useReadContract({
    address: RINGS_CONTRACT_ADDRESS,
    abi: RINGS_ABI,
    functionName: 'nextRingId',
  });

  // Fetch all rings
  const fetchAllRings = async () => {
    if (!nextRingId || !publicClient) {
      console.log('Missing nextRingId or publicClient:', { nextRingId, publicClient: !!publicClient });
      return;
    }
    
    setIsLoading(true);
    const ringCount = Number(nextRingId);
    console.log('Fetching rings. Total count:', ringCount);
    const allRings: RingData[] = [];

    try {
      // Fetch each ring's data
      for (let i = 0; i < ringCount; i++) {
        console.log(`Fetching ring #${i}`);
        try {
          const ringData = await publicClient.readContract({
            address: RINGS_CONTRACT_ADDRESS,
            abi: RINGS_ABI,
            functionName: 'rings',
            args: [BigInt(i)],
          });
          console.log(`Ring #${i} data:`, ringData);
          
          if (ringData) {
          // The rings function returns exactly 4 values: id, buyIn, maxPlayers, isActive
          const [id, buyIn, maxPlayers, isActive] = ringData as [bigint, bigint, bigint, boolean];
          
          // Get players for this ring from events
          const playerJoinedEvents = await publicClient.getContractEvents({
            address: RINGS_CONTRACT_ADDRESS,
            abi: RINGS_ABI,
            eventName: 'PlayerJoined',
            fromBlock: 'earliest',
            toBlock: 'latest',
            args: {
              ringId: BigInt(i),
            },
          });

          const participants = playerJoinedEvents.map((event: any) => event.args.player);
          const totalPot = buyIn * BigInt(participants.length);

          allRings.push({
            id: Number(id),
            buyIn: formatEther(buyIn),
            maxPlayers: Number(maxPlayers),
            participants,
            isActive,
            totalPot: formatEther(totalPot),
          });
          console.log(`Added ring #${i} to list:`, { id: Number(id), buyIn: formatEther(buyIn), maxPlayers: Number(maxPlayers), participants, isActive });
        }
        } catch (err) {
          console.error(`Error fetching ring #${i}:`, err);
        }
      }

      console.log('Final rings list:', allRings);
      setRings(allRings);
    } catch (error) {
      console.error('Error fetching rings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllRings();
  }, [nextRingId, publicClient]);

  // Watch for RingCreated events
  useWatchContractEvent({
    address: RINGS_CONTRACT_ADDRESS,
    abi: RINGS_ABI,
    eventName: 'RingCreated',
    onLogs() {
      refetchNextRingId();
      fetchAllRings();
    },
  });

  // Watch for PlayerJoined events
  useWatchContractEvent({
    address: RINGS_CONTRACT_ADDRESS,
    abi: RINGS_ABI,
    eventName: 'PlayerJoined',
    onLogs() {
      fetchAllRings();
    },
  });

  // Watch for WinnerDeclared events
  useWatchContractEvent({
    address: RINGS_CONTRACT_ADDRESS,
    abi: RINGS_ABI,
    eventName: 'WinnerDeclared',
    onLogs() {
      fetchAllRings();
    },
  });

  return {
    rings,
    isLoading,
    refetch: fetchAllRings,
  };
}
