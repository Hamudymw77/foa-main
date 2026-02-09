import { useState, useEffect } from 'react';
import { Transfer } from '@/types';
import { DataService } from '../services/dataService';

export function useTransferData() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTransfers() {
      setIsLoading(true);
      try {
        const data = await DataService.getTransfers();
        setTransfers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransfers();
  }, []);

  return { transfers, isLoading };
}
