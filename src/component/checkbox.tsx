import React from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

const Checkbox = ({
  text,
  checked,
  setChecked,
}: {
  text: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}) => {
  return (
    <BouncyCheckbox
      size={40}
      fillColor="#55c1ff"
      unFillColor="#FFFFFF"
      text={text}
      textStyle={{
        fontSize: 30,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'right',
        textDecorationLine: 'none', // Remove strikethrough
      }}
      isChecked={checked}
      onPress={() => {
        setChecked(!checked);
      }}
      style={{ marginBottom: 10 }}
    />
  );
};

export default Checkbox;
