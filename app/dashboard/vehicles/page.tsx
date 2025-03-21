"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, truncateString } from "@/lib/utils";

// Define vehicle type
export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  dealer_id: string;
  dealer_name?: string;
  image_url?: string;
  created_at: string;
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const vehiclesPerPage = 10;

  // Initialize Supabase client
  const supabase = createClient();

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // In a real application, this would fetch from Supabase
      // For now, we'll use mock data
      const mockVehicles: Vehicle[] = [
        {
          id: "1",
          make: "Toyota",
          model: "Camry",
          year: 2020,
          price: 22500,
          mileage: 25000,
          dealer_id: "1",
          dealer_name: "ABC Motors",
          image_url: "https://via.placeholder.com/150",
          created_at: "2023-10-15T14:30:00Z",
        },
        {
          id: "2",
          make: "Honda",
          model: "Accord",
          year: 2019,
          price: 20800,
          mileage: 32000,
          dealer_id: "1",
          dealer_name: "ABC Motors",
          image_url: "https://via.placeholder.com/150",
          created_at: "2023-10-16T10:15:00Z",
        },
        {
          id: "3",
          make: "Ford",
          model: "F-150",
          year: 2021,
          price: 38900,
          mileage: 15000,
          dealer_id: "2",
          dealer_name: "XYZ Auto",
          image_url: "https://via.placeholder.com/150",
          created_at: "2023-10-17T09:45:00Z",
        },
        {
          id: "4",
          make: "Chevrolet",
          model: "Silverado",
          year: 2022,
          price: 42000,
          mileage: 8000,
          dealer_id: "2",
          dealer_name: "XYZ Auto",
          image_url: "https://via.placeholder.com/150",
          created_at: "2023-10-18T16:20:00Z",
        },
        {
          id: "5",
          make: "BMW",
          model: "X5",
          year: 2020,
          price: 55000,
          mileage: 22000,
          dealer_id: "3",
          dealer_name: "Luxury Motors",
          image_url: "https://via.placeholder.com/150",
          created_at: "2023-10-19T11:30:00Z",
        },
      ];

      setVehicles(mockVehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter and search vehicles
  const filteredVehicles = vehicles
    .filter((vehicle) => {
      if (filter === "all") return true;
      return vehicle.dealer_id === filter;
    })
    .filter((vehicle) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        vehicle.make.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.year.toString().includes(term) ||
        vehicle.dealer_name?.toLowerCase().includes(term)
      );
    });

  // Pagination
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(
    indexOfFirstVehicle,
    indexOfLastVehicle
  );
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <Link href="/dashboard/dealers">
          <Button className="ml-4">Manage Dealers</Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search vehicles..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p>Loading vehicles...</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Make/Model</TableHead>
                  <TableHead className="w-[100px]">Year</TableHead>
                  <TableHead className="w-[120px]">Price</TableHead>
                  <TableHead className="w-[120px]">Mileage</TableHead>
                  <TableHead className="w-[180px]">Dealer</TableHead>
                  <TableHead className="w-[180px]">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      {vehicle.make} {vehicle.model}
                    </TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>${vehicle.price.toLocaleString()}</TableCell>
                    <TableCell>{vehicle.mileage.toLocaleString()} mi</TableCell>
                    <TableCell>{vehicle.dealer_name}</TableCell>
                    <TableCell>{formatDate(vehicle.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-l-md"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-r-md"
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 