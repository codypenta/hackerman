import React from 'react';

/**
 * InputWithLabel shows us how to make a flexible, complex, and re-usable react component
 *
 * @param id            The ID used to keep each instance of InputWithLabel unique
 * @param value         What we want to initialize the value with
 * @param type          Allows us to "API"ze out component known as a React Controlled Component
 * @param onInputChange Lets us callback and raise the state of a component
 * @param isFocused     Lets us link to the DOMs API and use React imperatively through side effects
 */

type InputWithLabelProps = {
    id: string;
    value: string;
    type?: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isFocused?: boolean;
    children: React.ReactNode;
  }
  const InputWithLabel = ({
    id,
    value,
    type = 'text',
    onInputChange,
    isFocused,
    children
  }: InputWithLabelProps) => {
    const inputRef = React.useRef<HTMLInputElement>(null!);
    React.useEffect(() => {
      if (isFocused && inputRef.current) inputRef.current.focus();
    }, [isFocused]);
  
    return (
      <>
        <label htmlFor={id}>
          {children}
          &nbsp;
          <input
            ref={inputRef}
            id={id}
            type={type}
            value={value}
            onChange={onInputChange}
            className="px-3 py-3 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline"
          />
        </label>
      </>
    );
  };

export default InputWithLabel;