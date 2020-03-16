import React from 'react';
import { sortBy } from 'lodash';

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

const SORTS: any = {
    NONE: (list: any) => list,
    TITLE: (list: any) => sortBy(list, 'title'),
    AUTHOR: (list: any) => sortBy(list, 'author'),
    COMMENT: (list: any) => sortBy(list, 'num_comments').reverse(),
    POINT: (list: any) => sortBy(list, 'points').reverse(),
}

const List = ({ list, onRemoveItem }: ListProps) => {
    const [sort, setSort] = React.useState({
        sortKey: 'NONE',
        isReverse: false,
    });

    const handleSort = (sortKey: any) => {
        const isReverse = sort.sortKey === sortKey && !sort.isReverse;

        setSort({ sortKey, isReverse });
    };

    const sortFunction = SORTS[sort.sortKey];
    let sortedList = sort.isReverse
        ? sortFunction(list).reverse()
        : sortFunction(list);

    console.log(sortedList)
    console.log(sortFunction)

    return (
        <div className="flex flex-col">
            <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" onClick={() => handleSort('TITLE')}>
                                        Title
                                    </button>
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" onClick={() => handleSort('AUTHOR')}>
                                        Author
                                    </button>
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" onClick={() => handleSort('COMMENT')}>
                                        Comments
                                    </button>
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                    <button type="button" onClick={() => handleSort('POINT')}>
                                        Points
                                    </button>
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {sortedList.map((item: any) => (
                                <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

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
        <tr>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={`https://source.unsplash.com/user/${item.objectID}/800X600`} alt="" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm leading-5 font-medium text-gray-900"><a href={item.url}>{item.title}</a></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <div className="text-sm leading-5 text-gray-900">{item.author}</div>
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <div className="text-sm leading-5 text-gray-900">{item.num_comments}</div>
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <div className="text-sm leading-5 text-gray-500">{item.points}</div>
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    <button type="button" onClick={handleRemoveItem}>
                        Dismiss
                    </button>
                </span>
            </td>
        </tr>
    );
};

export default List;