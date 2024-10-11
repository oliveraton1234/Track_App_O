
import { useFonts } from 'expo-font';

import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';


import { ScrollView, Text, Image, StyleSheet, Platform, View, Button, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [location2, setLocation2] = useState();
  const [errorMsg, setErrorMsg] = useState('');
  const [savedLocations, setSavedLocations] = useState([]);

  useEffect(() => {
    (async () => {
      // Solicitar permisos de ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Obtener la ubicación actual
      let loc = await Location.getCurrentPositionAsync({});
      setLocation2(loc); // Establece la ubicación obtenida
      console.log(savedLocations);
    })();

    loadSavedLocations();
  }, []);

  var text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location2) {
    text = JSON.stringify(location2);
    
  }

  const loadSavedLocations = async () => {
    try {
      const storedLocations = await AsyncStorage.getItem('savedLocations');
      if (storedLocations) {
        setSavedLocations(JSON.parse(storedLocations));
      }
    } catch (error) {
      console.log('Error al cargar las ubicaciones guardadas', error);
    }
  };

  const handleSaveLocation = async () => {
    try {
      if (location2) {

        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location2.coords.latitude,
          longitude: location2.coords.longitude,
        });
        const postalCode = reverseGeocode[0]?.postalCode || 'Código postal no disponible';
        const street = reverseGeocode[0]?.street || 'Calle no disponible';

        const newLocation = {
          latitude: location2.coords.latitude,
          longitude: location2.coords.longitude,
          street: street,
          postalCode: postalCode,
        };

        const updatedLocations = [...savedLocations, newLocation];
        await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
        setSavedLocations(updatedLocations);
        alert('Ubicación guardada con éxito');
      }
    } catch (error) {
      console.log('Error al guardar la ubicación', error);
    }
  };

  return (
    <SafeAreaView style={{flex:1}}>
      <StatusBar barStyle="dark-content" translucent={true} />
      {
        location2 != null && 
        <MapView
        style={styles.algo}
        initialRegion={{
          latitude: location2?.coords?.latitude || 37.78825,
          longitude: location2?.coords?.longitude || -122.4324,
          latitudeDelta: 0.0072,
          longitudeDelta: 0.0071,
        }}
        >
          <Marker
            coordinate={{
              latitude: location2?.coords?.latitude || 37.78825,
              longitude: location2?.coords?.longitude || -122.4324,
            }}
            title="Mi ubicación"
            description="Estoy aquí"
            pinColor='#ffc543'
          />
        </MapView>
      }
      <View 
        style={styles.viewContainer}
      >
        <TouchableOpacity style={styles.button} onPress={handleSaveLocation}>
          <View style={styles.buttonContent}>
            <Icon name="save" size={22} color="#000000"  />
            <Text style={styles.buttonText}>Guardar Ubicación</Text>
          </View>
        </TouchableOpacity>

        <ScrollView style={styles.subContainer}>
          <Text style={styles.title}>Ubicaciones guardadas:</Text>
          {savedLocations.length > 0 ? (
            savedLocations.map((locations, index) => (
              <View key={index} style={styles.locationItem}>
                <Text>Latitud: {locations.latitude}</Text>
                <Text>Longitud: {locations.longitude}</Text>
                <Text>Calle: {locations.street}</Text>
                <Text>Código Postal: {locations.postalCode}</Text>
              </View>
            ))
          ) : (
            <Text>No hay ubicaciones guardadas aún.</Text>
          )}
        </ScrollView>

        </View>
    </SafeAreaView>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  algo:{
    width: '100%', 
    height: '50%', 
    marginTop: StatusBar.currentHeight, 
    borderRadius: 20, 
    
    
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    marginVertical: 14,
    // backgroundColor: Platform.OS === 'ios' ? 'black' : 'blue', 
    backgroundColor: '#ffc543', 
    borderRadius: 50, 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000', 
    marginLeft: 8, 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  viewContainer: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    height: 'auto',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
    marginHorizontal: 5,
  },
  subContainer:{
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  }, 
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  locationItem: {
    marginBottom: 10,
    backgroundColor: '#f6f6f6',
    padding: 10,
    borderRadius: 20,
    marginHorizontal:5
  },
});