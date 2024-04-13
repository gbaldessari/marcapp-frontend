import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import 'text-encoding-polyfill';
import Joi from 'joi';
import loginService from '../services/login.service';
import { useNavigation } from '@react-navigation/native';
import useStore from '../stores/useStore';

const loginSchema = Joi.object({
  user: Joi.string().min(1).max(10),
  password: Joi.string().min(1).max(10),
});

const FormInput = ({ label, placeholder, errorMessage, onChangeText, secureTextEntry }: { label: string, placeholder: string, errorMessage: string, onChangeText: (value: string) => void, secureTextEntry?: boolean }) => (
  <Input
    label={label}
    placeholder={placeholder}
    errorMessage={errorMessage}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
  />
);

const Login = () => {
  const navigation = useNavigation();
  const { setUser: setUserStore } = useStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<string>('');
  const [errorMessageUser, setErrorMessageUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessagePassword, setErrorMessagePassword] = useState<string>('');

  useEffect(() => {
    const errors = loginSchema.validate({ user });

    if (errors?.error?.details[0]?.context?.key === 'user') {
      setErrorMessageUser(errors.error.details[0].message);
    } else{
      setErrorMessageUser('');
    }
    return;
  }, [user]);
  
  useEffect(() => {
    const errors = loginSchema.validate({ password });

    if (errors?.error?.details[0]?.context?.key === 'password') {
      setErrorMessagePassword(errors.error.details[0].message);
    } else{
      setErrorMessagePassword('');
    }
    return;
  }, [password]);

  const onLogin = async () => {
    const payload = { user, password };
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUserStore(user);
      navigation.navigate('Home');
    }, 1000);
    // const response = await loginService(payload);
  };

  return (
    <View
      style={{ flex: 1, justifyContent: 'center', backgroundColor: 'white' }}
    >
      <FormInput
        label="Usuario"
        placeholder="Juanito"
        errorMessage={errorMessageUser}
        onChangeText={(value: string) => setUser(value)}
      />
      <FormInput
        secureTextEntry
        label="Contraseña"
        placeholder="********"
        errorMessage={errorMessagePassword}
        onChangeText={(value: string) => setPassword(value)}
      />
      <Button title="Login" onPress={onLogin} loading={loading} />
    </View>
  );
};

export default Login;