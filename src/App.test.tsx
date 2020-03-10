import React from 'react';
// import { render } from '@testing-library/react';  // Comes pre-installed with React?
import renderer from 'react-test-render';         // Jest Documentation says use this?
import App from './App';
import { render } from '@testing-library/react';
import List, { Item } from './List';
import SearchForm from './SearchForm';
import axios from 'axios';

jest.mock('axios');

/**
 * Test in Jest Consist of 'test suites' (describe), which are comprised of 'test cases' (it), which have 'assertions' (expect) that turn out green or red
 * 
 * TODO: Rewrite test according to react and create-react-docs
 */

// test('renders learn react link', () => {
//   const { getByText } = render(<App />);
//   const linkElement = getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

describe('Item', () => {
  const item = {
    title: 'React',
    url: 'https://reactjs.org',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: '0',
  };
  const handleRemoveItem = jest.fn()

  let component: any;

  beforeEach(() => {
    component = renderer.create(<Item item={item} onRemoveItem={handleRemoveItem} />)
  })

  it('renders all properties', () => {
    expect(component.root.findByType('a').props.href).toEqual('https://reactjs.org');

    expect(
      component.root.findAllByProps({ children: 'Jordan Walke'})
      .length)
      .toEqual(1)
  })

  it('calls onRemoveItem on button click', () => {
    component.root.findByType('button').props.onClick();

    expect(handleRemoveItem).toHaveBeenCalledTimes(1);
    expect(handleRemoveItem).toHaveBeenCalledWith(item);

    expect(component.root.findAllByType(Item).length).toEqual(1);
  })

  it('renders snapshot', () => {
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('List', () => {
  const list = [
    {
      title: 'React',
      url: 'https://reactjs.org',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: '0',
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org',
      author: 'Dan Abramove, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: '0',
    }
  ]

  it('renders two items', () => {
    const component = renderer.create(<List list={list} onRemoveItem={() => {}} />)

    expect(component.root.findAllByType(Item).length).toEqual(2);
  })
})

describe('SearchForm', () => {
  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  };

  let component: any;

  beforeEach(() => {
    component = renderer.create(<SearchForm {...searchFormProps} />)
  });

  it('renders the input field with its value', () => {
    const value = component.root.findByType('input').props.value;

    expect(value).toEqual('React')
  })

  it('changes the input field', () => {
    const psuedoEvent = { target: 'Redux' };

    component.root.findByType('input').props.onChange(psuedoEvent);

    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
    expect(searchFormProps.onSearchInput).toHaveBeenCalledWith(psuedoEvent);
  })

  it('submits the form', () => {
    const psuedoEvent = {};

    component.root.findByType('form').props.onSubmit(psuedoEvent);

    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledWith(psuedoEvent);
  })

  it('disables the button and prevents submit', () => {
    component.update(
      <SearchForm {...searchFormProps} searchTerm=""/>
    );

    expect(component.root.findByType('button').props.disabled).toBeTruthy()
  })
})

describe('App', () => {
  it('succeeds fetching data with a list', async () => {
    const list = [
      {
        title: 'React',
        url: 'https://reactjs.org',
        author: 'Jordan Walke',
        num_comments: 3,
        points: 4,
        objectID: 0,
      },
      {
        title: 'Redux',
        url: 'https://redux.js.org',
        author: 'Dan Abramove, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1,
      }
    ];

    const promise = Promise.resolve({
      data: {
        hits: list,
      }
    })

    // @ts-ignore
    axios.get.mockImplementationOnce(() => promise);

    let component: any;

    await renderer.act(async () => component = renderer.create(<App />))

    expect(component.root.findByType(List).props.list).toEqual(list);
  })

  it('fails fetching data with a list', async () => {
    const promise = Promise.reject();

    //@ts-ignore
    axios.get.mockImplementationOnce(() => promise);

    let component: any;

    await renderer.act(async () => component = renderer.create(<App />))

    expect(component.root.findByType('p').props.children).toEqual('Something went wrong ...')
  })
})