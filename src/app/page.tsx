'use client';

import LoadingSkeleton from '@/component/loadingSkeleton';
import Profile from '@/component/profile';
import { useState, useEffect } from 'react';
import { useCancellationStore } from '@/store/cancellationStore';
import { CancellationService } from '@/lib/cancellationService';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const { setDownsellVariant, downsellVariant } = useCancellationStore();

  // Mock user and subscription IDs (in real app, these would come from auth context)
  const mockUserId = '550e8400-e29b-41d4-a716-446655440001';
  const mockSubscriptionId = '550e8400-e29b-41d4-a716-446655440001';

  useEffect(() => {
    const fetchCancellationDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching cancellation details for user:', mockUserId);
        
        // Fetch cancellation details from the API
        const result = await CancellationService.getCancellation(mockUserId, mockSubscriptionId);
        
        if (result.success && result.data && result.data.length > 0) {
          const cancellationData = result.data[0];
          console.log('Cancellation data received:', cancellationData);
          
          // If variant exists in the database, set it in the store
          // NEVER update an existing variant - this ensures consistency
          if (cancellationData.downsell_variant) {
            console.log('Setting existing variant from database:', cancellationData.downsell_variant);
            setDownsellVariant(cancellationData.downsell_variant);
          } else {
            console.log('No variant found in database - will be generated when flow initializes');
            // Don't set a variant here - let the flow initialization handle it
          }
        } else {
          console.log('No cancellation data found for user - variant will be generated when flow initializes');
          // Don't set a variant here - let the flow initialization handle it
        }
      } catch (error) {
        console.error('Error fetching cancellation details:', error);
        console.log('Variant will be generated when flow initializes');
        // Don't set a variant here - let the flow initialization handle it
      } finally {
        setLoading(false);
        console.log('Cancellation details loading completed');
      }
    };

    fetchCancellationDetails();
  }, [setDownsellVariant]);

  if (loading) {
    return (
      <LoadingSkeleton />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Profile />
      </div>
    </div>
  );
}