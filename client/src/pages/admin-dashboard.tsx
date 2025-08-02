import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

interface Seller {
  id: number;
  userId: number;
  name: string;
  email: string;
  storeName: string;
  storeDescription: string;
  gstNumber: string;
  address: string;
  phoneNumber: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      if (!user) return;

      const response = await fetch('/api/admin/sellers', {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSellers(data);
      } else {
        throw new Error('Failed to fetch sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast({
        title: "Error",
        description: "Failed to load sellers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSellerAction = async (sellerId: number, action: 'approve' | 'reject') => {
    try {
      if (!user) return;

      const response = await fetch(`/api/admin/sellers/${sellerId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Seller ${action}d successfully`
        });
        fetchSellers(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} seller`);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing seller:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} seller`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const pendingSellers = sellers.filter(s => s.approvalStatus === 'pending');
  const approvedSellers = sellers.filter(s => s.approvalStatus === 'approved');
  const rejectedSellers = sellers.filter(s => s.approvalStatus === 'rejected');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage sellers and monitor platform activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers.length}</div>
            <p className="text-xs text-muted-foreground">
              {approvedSellers.length} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingSellers.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedSellers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active sellers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedSellers.length}</div>
            <p className="text-xs text-muted-foreground">
              Rejected applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Sellers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pending Seller Requests
            {pendingSellers.length > 0 && (
              <Badge variant="secondary">{pendingSellers.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingSellers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingSellers.map((seller) => (
                <div key={seller.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{seller.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><strong>Email:</strong> {seller.email}</p>
                        <p><strong>Store Name:</strong> {seller.storeName}</p>
                        <p><strong>Description:</strong> {seller.storeDescription}</p>
                        <p><strong>GST Number:</strong> {seller.gstNumber}</p>
                        <p><strong>Phone:</strong> {seller.phoneNumber}</p>
                        <p><strong>Address:</strong> {seller.address}</p>
                        <p className="text-xs text-gray-500">
                          <strong>Applied:</strong> {new Date(seller.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleSellerAction(seller.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSellerAction(seller.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Sellers */}
      <Card>
        <CardHeader>
          <CardTitle>All Sellers</CardTitle>
        </CardHeader>
        <CardContent>
          {sellers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No sellers found</p>
          ) : (
            <div className="space-y-4">
              {sellers.map((seller) => (
                <div key={seller.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{seller.name}</h3>
                    <p className="text-sm text-gray-600">{seller.email}</p>
                    <p className="text-sm text-gray-600">Store: {seller.storeName}</p>
                    <p className="text-xs text-gray-500">
                      Applied: {new Date(seller.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      seller.approvalStatus === 'approved' ? 'default' : 
                      seller.approvalStatus === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {seller.approvalStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}