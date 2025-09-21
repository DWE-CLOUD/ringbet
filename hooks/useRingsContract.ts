import { 
  useReadContract, 
  useWriteContract, 
  useWatchContractEvent,
  useAccount,
  useBalance 
} from 'wagmi';
import { RINGS_ABI, RINGS_CONTRACT_ADDRESS } from '@/lib/contracts/abi';
import { parseEther } from 'viem';

export function useRingsContract() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  // Get next ring ID
  const { data: nextRingId } = useReadContract({
    address: RINGS_CONTRACT_ADDRESS,
    abi: RINGS_ABI,
    functionName: 'nextRingId',
  });

  // Create a new ring
  const createRing = async (buyIn: number, maxPlayers: number) => {
    try {
      const tx = await writeContractAsync({
        address: RINGS_CONTRACT_ADDRESS,
        abi: RINGS_ABI,
        functionName: 'createRing',
        args: [BigInt(buyIn), BigInt(maxPlayers)],
        value: BigInt(buyIn), // Use the same buyIn amount
      });
      
      return tx;
    } catch (error) {
      console.error('Error creating ring:', error);
      throw error;
    }
  };

  // Join an existing ring
  const joinRing = async (ringId: number, buyIn: string) => {
    try {
      const tx = await writeContractAsync({
        address: RINGS_CONTRACT_ADDRESS,
        abi: RINGS_ABI,
        functionName: 'joinRing',
        args: [BigInt(ringId)],
        value: parseEther(buyIn), // Convert string ETH amount to wei
      });
      
      return tx;
    } catch (error) {
      console.error('Error joining ring:', error);
      throw error;
    }
  };

  // Get ring details
  const getRingDetails = (ringId: number) => {
    return useReadContract({
      address: RINGS_CONTRACT_ADDRESS,
      abi: RINGS_ABI,
      functionName: 'rings',
      args: [BigInt(ringId)],
    });
  };

  return {
    address,
    balance: balance?.value,
    nextRingId,
    createRing,
    joinRing,
    getRingDetails,
    isWriting,
  };
}
