import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Button } from 'react-native';
import { Box, Text } from 'native-base';
import tokenUseStore from '../../useStores/token.useStore';
import isAdminUseStore from '../../useStores/isAdmin.useStore';
import getWorkersService from '../../services/getWorkers.service';
import getRegistersOfWorkersService, { GetRegistersOfWorkersServiceResponseT } from '../../services/getRegistersOfWorkers.service';
import Toast from 'react-native-toast-message';
import { workersRegistersStyles } from '../../styles/workersRegisters.styles';

const WorkersRegistersScreen = () => {
  const { storedToken } = tokenUseStore();
  const { storedIsAdmin } = isAdminUseStore();
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [registers, setRegisters] = useState<any[]>([]);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });

  useEffect(() => {
    const fetchWorkers = async () => {
      if (storedIsAdmin === 3) {
        Toast.show({
          type: 'error',
          text1: 'Usuario no autorizado'
        });
        return;
      }

      const response = await getWorkersService(storedToken);
      if (response.success) {
        setWorkers(response.data.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error al obtener trabajadores'
        });
      }
    };
    fetchWorkers();
  }, [storedToken, storedIsAdmin]);

  const fetchRegisters = async (workerId: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + currentWeekOffset * 7 - startDate.getDay() + 1);
    startDate.setHours(0, 0, 0, 0); // Set start date to the beginning of the day
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    const payload = {
      id: workerId.toString(),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };

    const response: GetRegistersOfWorkersServiceResponseT = await getRegistersOfWorkersService(payload);
    if (response.success) {
      if (response.data.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No se encontraron registros para este trabajador'
        });
        setRegisters([]);
      } else {
        setRegisters(response.data);
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error al obtener registros'
      });
      setRegisters([]);
    }
  };

  useEffect(() => {
    if (selectedWorker) {
      fetchRegisters(selectedWorker.id);
    }
  }, [currentWeekOffset, selectedWorker]);

  const renderTable = () => {
    const startDate = new Date(dateRange.startDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }

    return (
      <View style={workersRegistersStyles.table}>
        <View style={workersRegistersStyles.tableHeader}>
          <Text style={workersRegistersStyles.tableHeaderText}>Día</Text>
          <Text style={workersRegistersStyles.tableHeaderText}>Registro</Text>
        </View>
        {dates.map((date, index) => {
          const register = registers.find((r: any) => new Date(r.date).toDateString() === date.toDateString());
          return (
            <View key={index} style={workersRegistersStyles.tableRow}>
              <View style={workersRegistersStyles.tableCell}>
                <Text style={workersRegistersStyles.tableText}>{date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</Text>
              </View>
              <View style={workersRegistersStyles.tableCell}>
                {register ? (
                  <>
                    <Text style={workersRegistersStyles.tableText}>Entrada: {register.timeEntry}</Text>
                    <Text style={workersRegistersStyles.tableText}>Salida: {register.timeExit}</Text>
                  </>
                ) : (
                  <Text style={workersRegistersStyles.tableText}>Sin registros</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const isNextWeekDisabled = () => {
    const today = new Date();
    const currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() + currentWeekOffset * 7);
    return currentStartDate > today;
  };

  return (
    <StyledBox>
      <ScrollView>
        {workers.map((worker: any) => (
          <TouchableOpacity key={worker.id} onPress={() => {
            setSelectedWorker(worker);
            fetchRegisters(worker.id);
          }}>
            <View style={workersRegistersStyles.workerContainer}>
              <Text style={workersRegistersStyles.workerText}>{worker.name} {worker.lastName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedWorker && (
        <>
          <Text style={workersRegistersStyles.subtitle}>Entradas y Salidas de {selectedWorker.name} {selectedWorker.lastName}</Text>
          <Text style={workersRegistersStyles.dateRangeText}>Semana del {dateRange.startDate} al {dateRange.endDate}</Text>
          <View style={workersRegistersStyles.buttonContainer}>
            <Button title="Semana Anterior" onPress={() => setCurrentWeekOffset(currentWeekOffset - 1)} />
            <Button title="Semana Siguiente" onPress={() => setCurrentWeekOffset(currentWeekOffset + 1)} disabled={isNextWeekDisabled()} />
          </View>
          {renderTable()}
        </>
      )}
    </StyledBox>
  );
};

const StyledBox = ({ children }: { children: React.ReactNode }) => (
  <View style={workersRegistersStyles.container}>
    <Box>{children}</Box>
  </View>
);

export default WorkersRegistersScreen;