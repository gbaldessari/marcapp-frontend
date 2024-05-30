import React, { useEffect, useRef, useState } from 'react';
import { Box, Center, VStack, AlertDialog, Spinner } from 'native-base';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Input } from 'react-native-elements';
import getUserDataService from "../services/getUserData.service";
import tokenUseStore from "../stores/tokenUseStore";
import { useNavigation } from '@react-navigation/core';
import 'text-encoding-polyfill';
import Joi from 'joi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import updateUserDataService from '../services/updateUserData.service';

type FormDataT = {
    name: string;
    lastName: string;
    birthdate: string;
};

const InitData: FormDataT = {
    name: '',
    lastName: '',
    birthdate: ''
};

const EditProfile = () => {
    const { storedToken } = tokenUseStore();
    const token = storedToken || '';
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [formData, setFormData] = useState<FormDataT>(InitData);
    const [alert, setAlert] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const cancelRef = useRef(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDisabledText, setIsDisabledText] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);

    const [errors, setErrors] = useState<Record<keyof FormDataT, string>>({
        name: '',
        lastName: '',
        birthdate: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                setFetching(true);
                try {
                    const response = await getUserDataService({ token });
                    if (response.success && response.data) {
                        setFormData({
                            name: response.data.name,
                            lastName: response.data.lastName,
                            birthdate: response.data.birthdate,
                        });
                        console.log(response);
                    } else {
                        Alert.alert('Error', response.error || 'Unable to fetch user data');
                    }
                } catch (error) {
                    Alert.alert('Error', 'Something went wrong while fetching user data');
                } finally {
                    setFetching(false);
                }
            }
        };

        fetchData();
    }, [token]);

    const handleInputChange = (field: keyof FormDataT) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        validateField(field, value);
    };

    const validateField = (field: keyof FormDataT, value: string) => {
        const schema = Joi.object({ [field]: editProfileSchema.extract(field) });
        const { error } = schema.validate({ [field]: value });
        setErrors(prev => ({
            ...prev,
            [field]: error ? error.details[0].message : '',
        }));
    };

    const isValidForm = () => {
        const { error } = editProfileSchema.validate(formData, { abortEarly: false });
        if (!error) return true;

        const fieldErrors = error.details.reduce((acc, { context, message }) => {
            if (context?.key) acc[context.key as keyof FormDataT] = message;
            return acc;
        }, {} as Record<keyof FormDataT, string>);

        setErrors(fieldErrors);
        return false;
    };

    const handleSubmit = async () => {
        if (!isValidForm()) return;
    
        const { name, lastName, birthdate } = formData;
        try {
            const response = await updateUserDataService({ token, name, lastName, birthdate });
            if (response?.success) {
                navigation.navigate('Inside');
            } else {
                Alert.alert('Error', response?.error || 'Failed to update user data');
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            Alert.alert('Error', 'Something went wrong while updating user data');
        }
    };
    

    if (fetching) {
        return (
            <Center flex={1}>
                <Spinner size="lg" />
            </Center>
        );
    }

    return (
        <View style={styles.container}>
            <Box style={styles.containerBox}>
                <CustomAlertDialog alert={alert} message={message} onClose={() => setAlert(false)} cancelRef={cancelRef} />
                <VStack space={4} alignItems='center'>
                <FormInput
                    label="Name"
                    placeholder=""
                    value={formData.name}
                    errorMessage={errors.name}
                    onChangeText={handleInputChange('name')} // Aquí pasas la función handleInputChange
                    disabled={isDisabledText}
                />
                <FormInput
                    label="Last Name"
                    placeholder=""
                    value={formData.lastName}
                    errorMessage={errors.lastName}
                    onChangeText={handleInputChange('lastName')} // Aquí pasas la función handleInputChange
                    disabled={isDisabledText}
                />
                <FormInput
                    label="Birthdate"
                    placeholder="DD/MM/AAAA"
                    value={formData.birthdate}
                    errorMessage={errors.birthdate}
                    onChangeText={handleInputChange('birthdate')} // Aquí pasas la función handleInputChange
                    disabled={isDisabledText}
                />

                    <NavigationButton title='Confirm Changes' onPress={handleSubmit} loading={loading} />
                    <NavigationButton title='Volver' onPress={() => navigation.navigate('Inside')} loading={false} />
                </VStack>
            </Box>
        </View>
    );
};

const FormInput = ({ label, placeholder, value, errorMessage, onChangeText, disabled }: { label: string; placeholder: string; value: string; errorMessage: string; onChangeText: (value: string) => void; disabled: boolean; }) => (
    <Input
        label={label}
        placeholder={placeholder}
        value={value} 
        errorMessage={errorMessage}
        onChangeText={onChangeText}
        disabled={disabled}
    />
);


const NavigationButton = ({ title, onPress, loading }: { title: string; onPress: () => void; loading: boolean }) => (
    <Center>
        <Button
            title={title}
            onPress={onPress}
            loading={loading}
            buttonStyle={{ marginVertical: 10, backgroundColor: '#6200ee' }}
        />
    </Center>
);

const CustomAlertDialog = ({ alert, message, onClose, cancelRef }: { alert: boolean; message: string; onClose: () => void; cancelRef: React.RefObject<any>; }) => (
    <AlertDialog leastDestructiveRef={cancelRef} isOpen={alert} onClose={onClose}>
        <AlertDialog.Content>
            <AlertDialog.CloseButton />
            <AlertDialog.Body>{message}</AlertDialog.Body>
        </AlertDialog.Content>
    </AlertDialog>
);

const editProfileSchema = Joi.object({
    name: Joi.string().min(1).max(20).required(),
    lastName: Joi.string().min(1).max(20).required(),
    birthdate: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required().custom((value, helpers) => {
        const [day, month, year] = value.split('/');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        const now = new Date();
        if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) {
            return helpers.error('any.invalid');
        }
        if (date > now) {
            return helpers.error('Fecha de nacimiento no puede ser en el futuro');
        }
        return value;
    }, 'Fecha de nacimiento')
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 10,
    },
    containerBox: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        margin: 30,
    },
});

export default EditProfile;