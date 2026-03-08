import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  upi_id: string | null;
  product: string;
  status: string;
  created_at: string;
}

export function PaymentHistorySection() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('payment_transactions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTransactions((data as any) || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="w-5 h-5" />
          Payment History
        </CardTitle>
        <CardDescription>Your payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm">
                    {new Date(tx.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {tx.product.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {tx.payment_method}
                    {tx.upi_id && (
                      <span className="block text-xs text-muted-foreground font-mono">{tx.upi_id}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
