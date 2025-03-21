"use client";

import Link from "next/link";
import { Plus, Search, Edit, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, XIcon, RefreshCwIcon } from "lucide-react";
import ScrapeButton from "./components/ScrapeButton";

// Define types for our dealer data
interface Dealer {
  id: string;
  name: string;
  website: string;
  status: string;
  vehicleCount: number;
  lastScraped: string;
  notes?: string;
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const supabase = createClient();

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('dealers').select('*');
      
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter === "active" ? "active" : "inactive");
      }
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      // Format the dealer data
      const formattedDealers = data.map(dealer => ({
        id: dealer.id,
        name: dealer.name,
        website: dealer.website_url,
        status: dealer.status.charAt(0).toUpperCase() + dealer.status.slice(1),
        vehicleCount: dealer.vehicle_count || 0,
        lastScraped: dealer.last_scraped || "Never",
        notes: dealer.notes
      }));
      
      setDealers(formattedDealers);
    } catch (error) {
      console.error("Error fetching dealers:", error);
      // Use mock data when there's an error or no database connection
      setDealers([
        {
          id: "1",
          name: "ABC Motors",
          website: "https://abcmotors.example.com",
          status: "Active",
          vehicleCount: 243,
          lastScraped: "Today, 2:30 PM",
        },
        {
          id: "2",
          name: "XYZ Autos",
          website: "https://xyzautos.example.com",
          status: "Active",
          vehicleCount: 118,
          lastScraped: "Today, 1:15 PM",
        },
        {
          id: "3",
          name: "City Cars",
          website: "https://citycars.example.com",
          status: "Inactive",
          vehicleCount: 87,
          lastScraped: "3 days ago",
        },
        {
          id: "4",
          name: "Premier Vehicles",
          website: "https://premiervehicles.example.com",
          status: "Active",
          vehicleCount: 187,
          lastScraped: "Yesterday, 4:45 PM",
        },
        {
          id: "5",
          name: "Highway Motors",
          website: "https://highwaymotors.example.com",
          status: "Active",
          vehicleCount: 95,
          lastScraped: "Yesterday, 2:15 PM",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this dealer?")) {
      try {
        const { error } = await supabase
          .from('dealers')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Refresh the list
        fetchDealers();
      } catch (error) {
        console.error("Error deleting dealer:", error);
        alert("Failed to delete dealer. Please try again.");
      }
    }
  };

  // Function to handle scraping a dealer website
  const handleScrape = async (dealerId: string) => {
    try {
      // In a real application, this would call the API
      console.log(`Scraping dealer ${dealerId}`);
      
      // You would make an API call here:
      // const response = await fetch(`/api/dealers/${dealerId}/scrape`, {
      //   method: 'POST',
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.error);
    } catch (error) {
      console.error("Error scraping dealer:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dealers</h2>
          <p className="text-gray-500">
            Manage dealer information for web scraping
          </p>
        </div>
        <Link
          href="/dashboard/dealers/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Dealer
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search dealers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchDealers()}
          />
        </div>
        <div>
          <select 
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setTimeout(fetchDealers, 0);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading dealers...</div>
        ) : dealers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No dealers found. Add your first dealer to get started.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Name</TableHead>
                  <TableHead className="w-[280px]">Website</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Vehicles</TableHead>
                  <TableHead className="w-[180px]">Last Scraped</TableHead>
                  <TableHead className="w-[130px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealers.map((dealer) => (
                  <TableRow key={dealer.id}>
                    <TableCell className="font-medium">{dealer.name}</TableCell>
                    <TableCell className="truncate">
                      <a
                        href={dealer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate inline-block max-w-full"
                      >
                        {dealer.website}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {dealer.status === "Active" ? (
                          <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <XIcon className="mr-2 h-4 w-4 text-red-500" />
                        )}
                        <span className="capitalize">{dealer.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{dealer.vehicleCount}</TableCell>
                    <TableCell>
                      {new Date(dealer.lastScraped).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" asChild>
                          <Link href={`/dashboard/dealers/${dealer.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDelete(dealer.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        <ScrapeButton 
                          dealerId={dealer.id} 
                          onSuccess={() => fetchDealers()} 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {dealers.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{dealers.length}</span> of{" "}
                <span className="font-medium">{dealers.length}</span> dealers
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 