
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { carsData } from '@/data/cars';

export const uploadCarsToFirebase = async () => {
  try {
    console.log('Starting to upload cars to Firebase...');
    
    // Check if cars already exist in Firebase
    const carsCollection = collection(db, 'cars');
    const existingCars = await getDocs(carsCollection);
    
    if (!existingCars.empty) {
      console.log('Cars already exist in Firebase. Skipping upload.');
      return { success: true, message: 'Cars already exist in Firebase' };
    }
    
    // Upload each car to Firebase
    const uploadPromises = carsData.map(async (car) => {
      const carDocRef = doc(db, 'cars', car.id);
      await setDoc(carDocRef, {
        name: car.name,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price,
        image: car.image,
        features: car.features,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        reviews: [],
        averageRating: 0
      });
      console.log(`Uploaded car: ${car.name}`);
    });
    
    await Promise.all(uploadPromises);
    console.log('All cars uploaded successfully!');
    
    return { success: true, message: `Successfully uploaded ${carsData.length} cars to Firebase` };
  } catch (error) {
    console.error('Error uploading cars to Firebase:', error);
    return { success: false, message: 'Failed to upload cars to Firebase', error };
  }
};
