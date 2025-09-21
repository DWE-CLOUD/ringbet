import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export function useWalletPayment() {
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync, data: txData, reset } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txData,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const sendPayment = async (amount: number, recipientAddress?: string): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    
    try {
      // Reset previous transaction data
      reset();
      setCurrentTxHash(null);
      
      // For now, send to a placeholder address or contract
      // In production, this should be your smart contract or treasury address
      const to = recipientAddress || '0x0000000000000000000000000000000000000000';
      
      const hash = await sendTransactionAsync({
        to: to as `0x${string}`,
        value: parseEther(amount.toString()),
        data: '0x' as `0x${string}`, // Empty data for simple transfer
      });

      setCurrentTxHash(hash);
      console.log('Transaction sent:', hash);
      
      // Set a timeout to auto-reset after 60 seconds
      const timeout = setTimeout(() => {
        console.log('Transaction timeout - auto resetting');
        setIsProcessing(false);
      }, 60000);
      setTimeoutId(timeout);
      
      return hash;
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      throw error;
    }
  };
  
  const resetPayment = () => {
    setIsProcessing(false);
    setCurrentTxHash(null);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    reset();
  };
  
  // Auto-reset when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && isProcessing) {
      console.log('Transaction confirmed - auto resetting');
      setTimeout(() => {
        resetPayment();
      }, 1000); // Small delay to show success
    }
  }, [isConfirmed, isProcessing]);

  return {
    sendPayment,
    resetPayment,
    isProcessing: isProcessing || isConfirming,
    isConfirmed,
    txHash: currentTxHash || txData,
    isConfirming,
  };
}
