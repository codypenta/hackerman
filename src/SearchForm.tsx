import React from "react";

import InputWithLabel from "./InputWithLabel";

/**
 * Search Form Component
 *
 * Search Form and InputWithLabel are one branch off the App component
 */
type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit
}: SearchFormProps) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm} className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1" style={{ transition: 'all .15s ease' }}>
      Search
    </button>
  </form>
);

export default SearchForm;
