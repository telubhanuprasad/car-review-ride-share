
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Car } from '@/types/car';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface CarFormData {
  name: string;
  description: string;
  type: string;
  engine: string;
  fuelType: string;
  transmission: string;
  seating: number;
  year: number;
  price: number;
  image: string;
  gallery: string;
  features: string;
}

const AdminPanel: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<CarFormData>({
    defaultValues: {
      name: '',
      description: '',
      type: '',
      engine: '',
      fuelType: '',
      transmission: '',
      seating: 4,
      year: new Date().getFullYear(),
      price: 0,
      image: '',
      gallery: '',
      features: ''
    }
  });

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const carsCollection = collection(db, 'cars');
      const carsSnapshot = await getDocs(carsCollection);
      const carsData = carsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Car[];
      setCars(carsData);
    } catch (error) {
      console.error('Error loading cars:', error);
      toast({
        title: "Error",
        description: "Failed to load cars",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CarFormData) => {
    try {
      const carData = {
        ...data,
        brand: data.type, // Using type as brand for consistency
        model: data.name.split(' ').slice(-1)[0] || data.name,
        seats: data.seating,
        features: data.features.split(',').map(f => f.trim()).filter(f => f),
        reviews: [],
        averageRating: 0
      };

      if (editingCar) {
        // Update existing car
        const carRef = doc(db, 'cars', editingCar.id);
        await updateDoc(carRef, carData);
        toast({
          title: "Success",
          description: "Car updated successfully",
        });
      } else {
        // Add new car
        await addDoc(collection(db, 'cars'), carData);
        toast({
          title: "Success",
          description: "Car added successfully",
        });
      }

      // Reset form and reload cars
      form.reset();
      setEditingCar(null);
      setShowAddForm(false);
      loadCars();
    } catch (error) {
      console.error('Error saving car:', error);
      toast({
        title: "Error",
        description: "Failed to save car",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setShowAddForm(true);
    form.reset({
      name: car.name,
      description: car.name, // Using name as description if not available
      type: car.brand,
      engine: car.fuelType,
      fuelType: car.fuelType,
      transmission: car.transmission,
      seating: car.seats,
      year: car.year,
      price: car.price,
      image: car.image,
      gallery: car.image, // Using main image as gallery if not available
      features: car.features?.join(', ') || ''
    });
  };

  const handleDelete = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;

    try {
      await deleteDoc(doc(db, 'cars', carId));
      toast({
        title: "Success",
        description: "Car deleted successfully",
      });
      loadCars();
    } catch (error) {
      console.error('Error deleting car:', error);
      toast({
        title: "Error",
        description: "Failed to delete car",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    setEditingCar(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Car Management</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus size={16} className="mr-2" />
          Add New Car
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCar ? 'Edit Car' : 'Add New Car'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Car name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type/Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Car type/brand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="engine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engine</FormLabel>
                        <FormControl>
                          <Input placeholder="Engine specification" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fuel type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Petrol">Petrol</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transmission" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seating Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Number of seats" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Manufacturing year" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (per day)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Price per day" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Main image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gallery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gallery URLs</FormLabel>
                        <FormControl>
                          <Input placeholder="Gallery image URLs (comma separated)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Car description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Features (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    <Save size={16} className="mr-2" />
                    {editingCar ? 'Update Car' : 'Add Car'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Cars Table */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Cars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell className="font-medium">{car.name}</TableCell>
                    <TableCell>{car.brand}</TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>${car.price}/day</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(car)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(car.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {cars.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No cars found. Add your first car using the form above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
