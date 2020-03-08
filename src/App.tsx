import React from 'react';
import axios from 'axios';

// Hacker News API Endpoint with Server-Side Searching
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

// The structure typing of what resposne we get back from the API
type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};
type Stories = Array<Story>;

// Custom React Hook: https://reactjs.org/docs/hooks-custom.html
const useSemiPersistentState = (key: string, initialState: string): [string, (newValue: string) => void] => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) ?? initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

// useReducer to manage complex state: https://reactjs.org/docs/hooks-reference.html#usereducer
type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
};

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
};

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story: any) => action.payload.objectID !== story.objectID
        )
      };
    default:
      throw new Error();
  }
};

export default function App(): JSX.Element {
  // Components State
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false
  });

  // Handler functions to react to changes in the application
  // Note: React.SyntheticEvent is often enough
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(event.target.value); }
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };
  const handleFetchStories = React.useCallback(async () => {
    if (!searchTerm) return;
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [url]);
  const handleRemoveStory = (item: Story) => {
    dispatchStories({ type: 'REMOVE_STORY', payload: item });
  };

  // Defining any side-effects that should happen as state changes
  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);


  return (
    <div>
      <h2>My Hacker Stories</h2>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

/**
 * Components below are to be refractored into a seperate components folder
 * but for now they are here to show uni-directional flow of us passing props down
 * to the next component
 */

// Search Form and InputWithLabel are one branch off the App component

/**
 * Search Form Component
 * 
 */

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }: SearchFormProps) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search</strong>
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm}>
      Submit
    </button>
  </form>
);

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
        />
      </label>
    </>
  );
};

// List and Item are the other branch off of the App Component

/**
 * List Component
 * 
 */

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
}

const List = ({ list, onRemoveItem }: ListProps) => (
  <>
    {list.map(item => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </>
)


/**
 * Item Component
 */

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
}

const Item = ({ item, onRemoveItem }: ItemProps)=> {
  // Handler can be here
  // Or in in JSX by
  //  onClick={onRemoveItem.bind(null, item)}
  //  onClick={() => onRemoveItem(item)} <- avoid is multi-line
  function handleRemoveItem() {
    onRemoveItem(item);
  }

  return (
    <>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={handleRemoveItem}>
          Dismiss
        </button>
      </span>
    </>
  );
};