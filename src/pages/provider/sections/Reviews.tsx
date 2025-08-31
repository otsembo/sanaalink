import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Provider, Review } from '@/types/provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Star, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ReviewsProps {
  provider: Provider;
}

export default function Reviews({ provider }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(name)')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data as Review[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching reviews';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider.id, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleResponse = async () => {
    if (!selectedReview) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('reviews')
        .update({
          response,
          response_at: new Date().toISOString()
        })
        .eq('id', selectedReview.id);

      if (error) throw error;

      // Update local state
      setReviews(reviews.map(review =>
        review.id === selectedReview.id
          ? { ...review, response, response_at: new Date().toISOString() }
          : review
      ));

      setSelectedReview(null);
      setResponse('');

      toast({
        title: 'Response submitted',
        description: 'Your response has been posted successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error posting response';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          {reviews.length > 0 && (
            <p className="text-sm text-gray-500">
              Average rating:{' '}
              {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}{' '}
              ({reviews.length} reviews)
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {renderStars(review.rating)}
                  </CardTitle>
                  <CardDescription>
                    by {(review as any).profiles.name} • {format(new Date(review.created_at), 'PP')}
                  </CardDescription>
                </div>
                {!review.response && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReview(review)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Respond
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Respond to Review</DialogTitle>
                        <DialogDescription>
                          Your response will be visible to all users.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Original Review</label>
                          <p className="text-sm">{review.comment}</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Response</label>
                          <Textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your response here..."
                            rows={4}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={handleResponse} disabled={isSubmitting}>
                          {isSubmitting ? 'Posting...' : 'Post Response'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{review.comment}</p>

              {review.response && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Response from Provider</p>
                  <p className="text-sm">{review.response}</p>
                  <p className="text-xs text-gray-500">
                    Responded on {format(new Date(review.response_at!), 'PP')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <Star className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">No reviews yet</p>
                <p className="text-sm">Reviews from your customers will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}