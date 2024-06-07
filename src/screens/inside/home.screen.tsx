import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Box, Text } from 'native-base';
import { Button } from 'react-native-elements';
import tokenUseStore from '../../useStores/token.useStore';
import scheduleService from '../../services/schedule.service';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationRoutes } from '../../navigators/types/navigationRoutes.type';
import isAdminUseStore from '../../useStores/isAdmin.useStore';

const HomeScreen = () => {
  const { storedToken } = tokenUseStore();
  const { storedIsAdmin } = isAdminUseStore();
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NativeStackNavigationProp<NavigationRoutes>>();

  const handlePressEntry = async () => {
    setLoading(true);
    const token: string = storedToken || "";
    const isEntry: boolean = true;
    const response = await scheduleService({ token, isEntry});
    console.log(response);
    setLoading(false);
  };

  const handlePressExit = async () => {
    setLoading(true);
    const token: string = storedToken || "";
    const isEntry: boolean = false;
    const response = await scheduleService({ token, isEntry});
    console.log(response);
    setLoading(false);
  };

  const handlePressWeekResume = async () => {
    navigation.navigate('WeekResume');
  };

  const handlePressAdmin = async () => {
    navigation.navigate('AdminMenu');
  };

  

  return (
    <StyledBox>
      <Text style={styles.title}>Bienvenido</Text>
      <ScheduleButton title="Marcar Entrada" onPress={handlePressEntry} loading={loading} />
      <ScheduleButton title="Marcar Salida" onPress={handlePressExit} loading={loading} />
      <ScheduleButton title="Resumen de la semana" onPress={handlePressWeekResume} loading={loading} />
      {storedIsAdmin !== 3&& (
        <ScheduleButton title="Menu Administrador" onPress={handlePressAdmin} loading={loading} />
      )}
    </StyledBox>
  );
};

const ScheduleButton = ({ title, onPress, loading }: { title: string; onPress: () => void; loading: boolean }) => (
  <Button
    title={title}
    onPress={onPress}
    loading={loading}
    containerStyle={styles.buttonContainer}
    buttonStyle={styles.button}
  />
);

const StyledBox = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.container}>
    <Box>{children}</Box>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 10,
  },
  title: {
    fontSize: 35,
    textAlign: 'center',
    lineHeight: 35,
    marginBottom: 20,
  },
  userText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    alignSelf: 'center',
    width: '80%',
  },
  button: {
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    height: 60,
    marginVertical: 10,
  },
});

export default HomeScreen;