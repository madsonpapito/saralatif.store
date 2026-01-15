import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import { getProductById, getProductVariants } from '@/lib/product-utils';
import { Product } from '@/types';

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductPageProps) {
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
        return { title: 'Product Not Found' };
    }

    return {
        title: `${product.title} | Sara Latif Fine Art`,
        description: product.description,
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
        notFound();
    }

    const variants = getProductVariants(product);
    // Combine current product + variants to show all options
    const allVariants = [product, ...variants].sort((a, b) => a.price - b.price);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Image */}
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                    />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-center">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mb-4">
                            {product.title}
                        </h1>
                        <p className="text-2xl text-gray-600 mb-6">
                            €{product.price.toFixed(2)}
                        </p>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            {product.description}
                        </p>
                    </div>

                    {/* Size Selector */}
                    {allVariants.length > 1 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-medium tracking-wider text-gray-900 uppercase mb-3">
                                Select Size
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {allVariants.map((variant) => (
                                    <a
                                        key={variant.id}
                                        href={`/product/${variant.id}`}
                                        className={`px-4 py-2 border text-sm transition-colors duration-200 ${variant.id === product.id
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-gray-300 text-gray-700 hover:border-gray-900'
                                            }`}
                                    >
                                        {variant.creativeHubSettings.size}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <AddToCartButton product={product} />

                    {/* Product Details */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-sm font-medium tracking-wider text-gray-900 uppercase mb-4">
                            Print Details
                        </h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Paper</dt>
                                <dd className="text-gray-900">{product.creativeHubSettings.paperId}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Size</dt>
                                <dd className="text-gray-900">{product.creativeHubSettings.size}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Dimensions</dt>
                                <dd className="text-gray-900">{product.printOptionDescription || '-'}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Finish</dt>
                                <dd className="text-gray-900">Matte, Unframed</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Shipping</dt>
                                <dd className="text-gray-900">Worldwide, 5-10 business days</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quality Note */}
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            <strong>Museum Quality:</strong> Each print is produced using
                            Giclée printing technology on archival-grade Hahnemühle paper.
                            Colors are guaranteed for 100+ years.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
