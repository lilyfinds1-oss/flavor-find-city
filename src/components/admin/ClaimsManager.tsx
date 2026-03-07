import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Building2, Mail, FileText, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Claim {
  id: string;
  restaurant_id: string;
  user_id: string;
  business_email: string;
  proof_description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  restaurants?: { name: string; slug: string } | null;
  profiles?: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
}

function useAdminClaims(status?: string) {
  return useQuery({
    queryKey: ["admin-claims", status],
    queryFn: async () => {
      let query = supabase
        .from("restaurant_claims")
        .select(`
          *,
          restaurants:restaurant_id (name, slug),
          profiles:user_id (display_name, username, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Claim[];
    },
  });
}

function useUpdateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const { error } = await supabase
        .from("restaurant_claims")
        .update({ status, admin_notes: adminNotes || null, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
    },
  });
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

export default function ClaimsManager() {
  const [activeTab, setActiveTab] = useState("pending");
  const { data: claims, isLoading } = useAdminClaims(activeTab);
  const updateClaim = useUpdateClaim();
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const handleAction = async (id: string, status: string) => {
    try {
      await updateClaim.mutateAsync({ id, status, adminNotes: adminNotes.trim() || undefined });
      toast.success(`Claim ${status} successfully`);
      setSelectedClaim(null);
      setAdminNotes("");
    } catch {
      toast.error("Failed to update claim");
    }
  };

  const openDetail = (claim: Claim) => {
    setSelectedClaim(claim);
    setAdminNotes(claim.admin_notes || "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Restaurant Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {claims && claims.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Claimant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => {
                      const config = statusConfig[claim.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      return (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {claim.restaurants?.name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {claim.profiles?.display_name || claim.profiles?.username || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {claim.business_email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={config.variant} className="gap-1">
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {claim.created_at && formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => openDetail(claim)}>
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No {activeTab !== "all" ? activeTab : ""} claims found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Claim</DialogTitle>
            <DialogDescription>
              {selectedClaim?.restaurants?.name} — claimed by {selectedClaim?.profiles?.display_name || "Unknown"}
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Business Email</p>
                  <p className="font-medium">{selectedClaim.business_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Current Status</p>
                  <Badge variant={statusConfig[selectedClaim.status]?.variant || "secondary"}>
                    {selectedClaim.status}
                  </Badge>
                </div>
              </div>

              {selectedClaim.proof_description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Proof of Ownership
                  </p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedClaim.proof_description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Admin Notes</p>
                <Textarea
                  placeholder="Add notes about this claim..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {selectedClaim.status !== "approved" && (
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleAction(selectedClaim.id, "approved")}
                    disabled={updateClaim.isPending}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                )}
                {selectedClaim.status !== "rejected" && (
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => handleAction(selectedClaim.id, "rejected")}
                    disabled={updateClaim.isPending}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                )}
                {selectedClaim.status !== "pending" && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleAction(selectedClaim.id, "pending")}
                    disabled={updateClaim.isPending}
                  >
                    <Clock className="w-4 h-4" />
                    Reset to Pending
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
