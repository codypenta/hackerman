import React from 'react';

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

/**
 * List Component
 * 
 * List re-renders even when it's sometime not necessarym use React.memo() for this
 * and change handleRemoveStory to a React.useCallback hook.
 * React.useMemo() can be used to avoid re-running expensive calculations until only
 * The dependency array changes
 * 
 * List and Item are the other branch off of the App Component
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

export const Item = ({ item, onRemoveItem }: ItemProps) => {
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

export default List;