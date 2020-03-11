import React from 'react';
import axios from 'axios';

import SearchForm from './SearchForm';
import List from './List';

// Hacker News API Endpoint with Server-Side Searching
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

// The structure typing of what resposne we get back from the API
type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: string;
  points: string;
};
type Stories = Array<Story>;

// Custom React Hook: https://reactjs.org/docs/hooks-custom.html
const useSemiPersistentState = (key: string, initialState: string): [string, (newValue: string) => void] => {
  const isMounted = React.useRef(false); // Don't render on first (Not needed by an example)

  const [value, setValue] = React.useState(
    localStorage.getItem(key) ?? initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
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
  // Note: React.SyntheticEvent is often enough https://reactjs.org/docs/events.html
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