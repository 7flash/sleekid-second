import { Link } from "wouter";

export default function Select(props: { defaultValue: string, options: string[], href: string, values: number[] }) {
    return <div className="dropdown inline-block relative">
        <button className="bg-gray-600 text-white font-semibold py-1 px-4 rounded inline-flex items-center">
            {
                props.defaultValue && <span className="mr-1">{props.defaultValue}</span>
            }
            {
                !props.defaultValue && <div className="w-20"></div>
            }
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
        </button>
        <ul className="dropdown-menu absolute hidden text-gray-700 pt-1">
        {
            props.options.map((option: string, index: number) => {
                return <li key={index}>
                    <Link href={`${props.href}/${props.values[index]}`} className="block px-4 py-2 text-sm text-white hover:bg-gray-400 bg-gray-600">{option}</Link>
                </li>
            })
        }
        </ul>
    </div>
}