"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import {
  listChildCategoriesAction,
  listLeafCategoriesAction,
  listRootCategoriesAction,
} from "@/actions/categories";
import {
  createProductPostAction,
  createProductPostMediaPresignedUrlAction,
  updateProductPostAction,
} from "@/actions/product-posts";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Spinner } from "@/components/atoms/spinner";
import { AlertDialog } from "@/components/molecules/overlay/AlertDialog";
import { DialogDescription } from "@/components/molecules/overlay/Dialog";
import { LocationRegisterDialog } from "@/components/molecules/overlay/LocationRegisterDialog";
import {
  PRODUCT_POST_DEFAULT_LATITUDE,
  PRODUCT_POST_DEFAULT_LONGITUDE,
  PRODUCT_POST_DESCRIPTION_MAX,
  PRODUCT_POST_DOCUMENT_MAX_PER_TYPE,
  PRODUCT_POST_DOCUMENT_MAX_TOTAL,
  PRODUCT_POST_DOCUMENT_MIN,
  PRODUCT_POST_IMAGE_MAX,
  PRODUCT_POST_IMAGE_MIN,
  PRODUCT_POST_MIN_PRICE_WON,
  PRODUCT_POST_NAME_MAX,
  PRODUCT_POST_NAME_MIN,
  PRODUCT_POSTS_PATH,
} from "@/constants/product-posts";
import { notifyIfSessionExpiredAction } from "@/lib/auth/session-expired.client";
import { pickDocumentsFieldError } from "@/lib/product-posts/pick-documents-field-error";
import { reverseGeocodeAdminRegion } from "@/lib/kakao-maps";
import {
  isAllowedMediaImageFile,
  MEDIA_IMAGE_ACCEPT,
  MEDIA_IMAGE_REJECT_MESSAGE,
  normalizeMediaImageContentType,
} from "@/lib/media/image-file";
import { putFileToS3 } from "@/lib/media/put-to-s3";
import { cn } from "@/lib/utils";
import type { UiCategorySummary } from "@/types/categories/ui";
import type {
  ApiCreateProductPostDocument,
  ConditionGrade,
} from "@/types/product-posts/api";
import type { UiProductPostDetail } from "@/types/product-posts/ui";

const DESCRIPTION_PLACEHOLDER = "상품에 대한 상세정보를 입력하세요.";

function isBlobUrl(url: string) {
  return url.startsWith("blob:");
}

function revokeIfBlob(url: string | null | undefined) {
  if (url && isBlobUrl(url)) URL.revokeObjectURL(url);
}

const fieldLabelClassName =
  "shrink-0 whitespace-nowrap font-sans text-sm text-white md:w-[120px] md:text-lg md:leading-[1.5] md:tracking-tight";

function CreateFieldRow({
  label,
  required,
  children,
  align = "center",
  labelGap = "md:gap-5",
  sublabel,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  align?: "center" | "start";
  /** Figma: 상품명 gap-16, 나머지 gap-20 */
  labelGap?: "md:gap-4" | "md:gap-5";
  sublabel?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        "md:flex-row",
        labelGap,
        align === "center" ? "md:items-center" : "md:items-start"
      )}
    >
      <div className="flex shrink-0 flex-col items-start md:w-[120px]">
        <span className="whitespace-nowrap font-sans text-sm text-white md:text-lg md:leading-[1.5] md:tracking-tight">
          {label}
          {required ? (
            <span className="ml-0.5 text-vh-brand-gold" aria-hidden>
              *
            </span>
          ) : null}
        </span>
        {sublabel ? (
          <span className="mt-0.5 font-sans text-xs text-[#ababab] md:text-sm md:tracking-tight">
            {sublabel}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 w-full flex-1">{children}</div>
    </div>
  );
}

type LocalImage = {
  id: string;
  previewUrl: string;
  fileName: string;
  /** CloudFront publicUrl — 업로드 완료 또는 수정 시 기존 URL */
  remoteUrl?: string;
  uploadStatus: "ready" | "uploading" | "error";
};

function ThumbCell({
  img,
  isRep,
  onSelect,
  onRemove,
}: {
  img: LocalImage;
  isRep: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const uploading = img.uploadStatus === "uploading";
  return (
    <div className="relative size-full">
      <button
        type="button"
        aria-label={isRep ? "대표사진" : "대표사진으로 선택"}
        aria-pressed={isRep}
        disabled={uploading}
        onClick={onSelect}
        className={cn(
          "relative size-full overflow-hidden",
          isRep
            ? "border-[3px] border-vh-brand-gold"
            : "border border-transparent"
        )}
      >
        <Image
          src={img.previewUrl}
          alt={img.fileName}
          fill
          unoptimized
          className="pointer-events-none object-cover"
        />
        {uploading ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Spinner size="sm" inline aria-label="이미지 업로드 중" />
          </span>
        ) : null}
      </button>
      <button
        type="button"
        aria-label="이미지 삭제"
        disabled={uploading}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-0.5 top-0.5 z-10 flex size-3.5 items-center justify-center bg-black/50 text-xs leading-none text-white disabled:opacity-40"
      >
        ×
      </button>
    </div>
  );
}

type DocApiType = "RECEIPT" | "WARRANTY" | "APPRAISAL" | "OTHER";

type LocalDocItem = {
  id: string;
  previewUrl: string;
  fileName: string;
  remoteUrl?: string;
  uploadStatus: "ready" | "uploading" | "error";
};

const GRADE_OPTIONS: { value: ConditionGrade; label: string }[] = [
  { value: "S", label: "S 급" },
  { value: "A", label: "A 급" },
  { value: "B", label: "B 급" },
  { value: "C", label: "C 급" },
];

const DOC_OPTIONS: { type: DocApiType; label: string }[] = [
  { type: "RECEIPT", label: "영수증" },
  { type: "WARRANTY", label: "보증서" },
  { type: "APPRAISAL", label: "감정서" },
  { type: "OTHER", label: "기타 서류" },
];

const selectClassName = cn(
  "h-[42px] w-full appearance-none border border-[#d0d0d0] bg-[#323232] px-2.5 font-sans text-sm text-white",
  "outline-none focus:border-vh-brand-gold disabled:opacity-50"
);

const underlineInputClassName = cn(
  "w-full border-0 border-b border-[#d0d0d0] bg-transparent px-1 py-2.5 font-sans text-base text-white outline-none",
  "placeholder:text-[#868686] focus:border-vh-brand-gold"
);

async function uploadProductPostMedia(file: File): Promise<string> {
  const contentType = normalizeMediaImageContentType(file.type);
  if (!contentType) {
    throw new Error(MEDIA_IMAGE_REJECT_MESSAGE);
  }
  const presign = await createProductPostMediaPresignedUrlAction({
    contentType,
    contentLength: file.size,
  });
  if (!presign.ok) {
    notifyIfSessionExpiredAction(presign);
    throw new Error(presign.message);
  }
  await putFileToS3(presign.data.uploadUrl, file, contentType);
  return presign.data.publicUrl;
}

export type ProductPostFormMode = "create" | "edit";

export type ProductPostFormInitialCategory = {
  rootUuid: string;
  midUuid: string;
  brandUuid: string;
};

export type ProductPostFormInitialValues = {
  post: UiProductPostDetail;
  category: ProductPostFormInitialCategory | null;
};

interface ProductPostCreateFormProps {
  mode?: ProductPostFormMode;
  initialValues?: ProductPostFormInitialValues;
}

function emptyDocs(): Record<DocApiType, LocalDocItem[]> {
  return {
    RECEIPT: [],
    WARRANTY: [],
    APPRAISAL: [],
    OTHER: [],
  };
}

function emptyDocChecked(): Record<DocApiType, boolean> {
  return {
    RECEIPT: false,
    WARRANTY: false,
    APPRAISAL: false,
    OTHER: false,
  };
}

function docsFromPost(post: UiProductPostDetail): {
  docs: Record<DocApiType, LocalDocItem[]>;
  checked: Record<DocApiType, boolean>;
} {
  const docs = emptyDocs();
  const checked = emptyDocChecked();
  for (const doc of post.documents) {
    const type = doc.type as DocApiType;
    if (!(type in docs)) continue;
    if (docs[type].length >= PRODUCT_POST_DOCUMENT_MAX_PER_TYPE) continue;
    docs[type].push({
      id: doc.uuid,
      previewUrl: doc.url,
      fileName: doc.type,
      remoteUrl: doc.url,
      uploadStatus: "ready",
    });
    checked[type] = true;
  }
  return { docs, checked };
}

function countReadyDocuments(docs: Record<DocApiType, LocalDocItem[]>) {
  return DOC_OPTIONS.reduce(
    (sum, opt) =>
      sum + docs[opt.type].filter((d) => Boolean(d.remoteUrl)).length,
    0
  );
}

export function ProductPostCreateForm({
  mode = "create",
  initialValues,
}: ProductPostCreateFormProps = {}) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const formId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryReady, setCategoryReady] = useState(
    !isEdit || !initialValues?.category
  );

  const [roots, setRoots] = useState<UiCategorySummary[]>([]);
  const [mids, setMids] = useState<UiCategorySummary[]>([]);
  const [brands, setBrands] = useState<UiCategorySummary[]>([]);
  const [rootUuid, setRootUuid] = useState(
    initialValues?.category?.rootUuid ?? ""
  );
  const [midUuid, setMidUuid] = useState(
    initialValues?.category?.midUuid ?? ""
  );
  const [brandUuid, setBrandUuid] = useState(
    initialValues?.category?.brandUuid ?? ""
  );

  const initialDocs = initialValues
    ? docsFromPost(initialValues.post)
    : {
        docs: emptyDocs(),
        checked: emptyDocChecked(),
      };

  const [images, setImages] = useState<LocalImage[]>(() =>
    (initialValues?.post.images ?? []).map((img) => ({
      id: img.uuid,
      previewUrl: img.url,
      fileName: `image-${img.sortOrder + 1}`,
      remoteUrl: img.url,
      uploadStatus: "ready" as const,
    }))
  );
  const [name, setName] = useState(initialValues?.post.name ?? "");
  const [grade, setGrade] = useState<ConditionGrade | "">(
    initialValues?.post.conditionGrade ?? ""
  );
  const [priceText, setPriceText] = useState(
    initialValues?.post.price != null ? String(initialValues.post.price) : ""
  );
  const [placeName, setPlaceName] = useState(
    initialValues?.post.placeName ?? ""
  );
  const [latitude, setLatitude] = useState<number | null>(
    initialValues?.post.latitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    initialValues?.post.longitude ?? null
  );
  const [regionDong, setRegionDong] = useState<string | null>(
    initialValues?.post.regionDong?.trim() || null
  );
  const [regionGu, setRegionGu] = useState<string | null>(
    initialValues?.post.regionGu?.trim() || null
  );
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [description, setDescription] = useState(
    initialValues?.post.description ?? ""
  );
  const [docs, setDocs] = useState<Record<DocApiType, LocalDocItem[]>>(
    initialDocs.docs
  );
  const [docChecked, setDocChecked] = useState<Record<DocApiType, boolean>>(
    initialDocs.checked
  );
  const [agreed, setAgreed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    void listRootCategoriesAction().then((res) => {
      if (res.ok) {
        setRoots(res.data.filter((c) => c.active));
      }
    });
  }, []);

  /**
   * 수정 모드: 상세에 동/구가 둘 다 없을 때만 lat/lng reverse geocode (1A fallback).
   * 상세 값이 있으면 useState 초기값으로 충분.
   */
  useEffect(() => {
    if (!isEdit) return;

    const fromDetailDong = initialValues?.post.regionDong?.trim() || null;
    const fromDetailGu = initialValues?.post.regionGu?.trim() || null;
    if (fromDetailDong || fromDetailGu) return;

    const lat = initialValues?.post.latitude;
    const lng = initialValues?.post.longitude;
    if (lat == null || lng == null) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    let cancelled = false;
    void (async () => {
      const admin = await reverseGeocodeAdminRegion(lat, lng);
      if (cancelled) return;
      setRegionDong(admin.regionDong);
      setRegionGu(admin.regionGu);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isEdit,
    initialValues?.post.regionDong,
    initialValues?.post.regionGu,
    initialValues?.post.latitude,
    initialValues?.post.longitude,
  ]);

  /** 수정 모드: 대·중·브랜드 옵션 로드 후 선택값 유지 */
  useEffect(() => {
    if (!isEdit || !initialValues?.category) {
      return;
    }
    const { rootUuid: r, midUuid: m, brandUuid: b } = initialValues.category;
    let cancelled = false;
    void (async () => {
      const midRes = await listChildCategoriesAction(r);
      if (cancelled) return;
      if (midRes.ok) setMids(midRes.data.filter((c) => c.active));
      else setMids([]);

      const brandRes = await listLeafCategoriesAction(m);
      if (cancelled) return;
      if (brandRes.ok) setBrands(brandRes.data.filter((c) => c.active));
      else setBrands([]);

      setRootUuid(r);
      setMidUuid(m);
      setBrandUuid(b);
      setCategoryReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, initialValues?.category]);

  useEffect(() => {
    return () => {
      for (const img of images) revokeIfBlob(img.previewUrl);
      for (const items of Object.values(docs)) {
        for (const item of items) revokeIfBlob(item.previewUrl);
      }
    };
    // unmount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMids = async (parent: string) => {
    setMidUuid("");
    setBrandUuid("");
    setBrands([]);
    if (!parent) {
      setMids([]);
      return;
    }
    const res = await listChildCategoriesAction(parent);
    if (res.ok) setMids(res.data.filter((c) => c.active));
    else setMids([]);
  };

  const loadBrands = async (parent: string) => {
    setBrandUuid("");
    if (!parent) {
      setBrands([]);
      return;
    }
    const res = await listLeafCategoriesAction(parent);
    if (res.ok) {
      const leaves = res.data.filter((c) => c.active);
      setBrands(leaves);
    } else setBrands([]);
  };

  const addImages = (files: FileList | null) => {
    if (!files?.length) return;
    const room = PRODUCT_POST_IMAGE_MAX - images.length;
    if (room <= 0) return;

    const accepted: { id: string; file: File; previewUrl: string }[] = [];
    for (const file of Array.from(files)) {
      if (accepted.length >= room) break;
      if (!isAllowedMediaImageFile(file)) {
        setFieldError(MEDIA_IMAGE_REJECT_MESSAGE);
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (!accepted.length) return;

    setImages((prev) => [
      ...prev,
      ...accepted.map(({ id, file, previewUrl }) => ({
        id,
        previewUrl,
        fileName: file.name,
        uploadStatus: "uploading" as const,
      })),
    ]);
    setFieldError(null);

    for (const item of accepted) {
      void (async () => {
        try {
          const publicUrl = await uploadProductPostMedia(item.file);
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id
                ? {
                    ...img,
                    remoteUrl: publicUrl,
                    uploadStatus: "ready" as const,
                  }
                : img
            )
          );
        } catch (e) {
          setImages((prev) => {
            const target = prev.find((img) => img.id === item.id);
            if (target) revokeIfBlob(target.previewUrl);
            return prev.filter((img) => img.id !== item.id);
          });
          setFieldError(
            e instanceof Error ? e.message : "이미지 업로드에 실패했습니다."
          );
        }
      })();
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) revokeIfBlob(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const setRepresentative = (id: string) => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      if (idx === 0) return prev;
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      return [picked, ...next];
    });
  };

  const toggleDoc = (type: DocApiType, checked: boolean) => {
    setDocChecked((prev) => ({ ...prev, [type]: checked }));
    if (!checked) {
      setDocs((prev) => {
        for (const item of prev[type]) {
          revokeIfBlob(item.previewUrl);
        }
        return { ...prev, [type]: [] };
      });
    }
  };

  const addDocFile = (type: DocApiType, file: File | null) => {
    if (!file) return;
    if (!isAllowedMediaImageFile(file)) {
      setFieldError(MEDIA_IMAGE_REJECT_MESSAGE);
      return;
    }
    if (docs[type].length >= PRODUCT_POST_DOCUMENT_MAX_PER_TYPE) {
      setFieldError(
        `서류는 종류별로 최대 ${PRODUCT_POST_DOCUMENT_MAX_PER_TYPE}개까지 등록할 수 있습니다.`
      );
      return;
    }
    const currentTotal = DOC_OPTIONS.reduce(
      (n, o) => n + docs[o.type].length,
      0
    );
    if (currentTotal >= PRODUCT_POST_DOCUMENT_MAX_TOTAL) {
      setFieldError(
        `서류는 최대 ${PRODUCT_POST_DOCUMENT_MAX_TOTAL}장까지 등록할 수 있습니다.`
      );
      return;
    }

    const id = `${type}-${file.name}-${file.size}-${crypto.randomUUID()}`;
    const previewUrl = URL.createObjectURL(file);
    setDocs((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        {
          id,
          previewUrl,
          fileName: file.name,
          uploadStatus: "uploading" as const,
        },
      ],
    }));
    setDocChecked((prev) => ({ ...prev, [type]: true }));
    setFieldError(null);

    void (async () => {
      try {
        const publicUrl = await uploadProductPostMedia(file);
        setDocs((prev) => ({
          ...prev,
          [type]: prev[type].map((item) =>
            item.id === id
              ? {
                  ...item,
                  remoteUrl: publicUrl,
                  uploadStatus: "ready" as const,
                }
              : item
          ),
        }));
      } catch (e) {
        setDocs((prev) => {
          const target = prev[type].find((item) => item.id === id);
          if (target) revokeIfBlob(target.previewUrl);
          const nextItems = prev[type].filter((item) => item.id !== id);
          if (nextItems.length === 0) {
            setDocChecked((c) => ({ ...c, [type]: false }));
          }
          return { ...prev, [type]: nextItems };
        });
        setFieldError(
          e instanceof Error ? e.message : "서류 이미지 업로드에 실패했습니다."
        );
      }
    })();
  };

  const removeDocItem = (type: DocApiType, id: string) => {
    setDocs((prev) => {
      const target = prev[type].find((item) => item.id === id);
      if (target) revokeIfBlob(target.previewUrl);
      const nextItems = prev[type].filter((item) => item.id !== id);
      if (nextItems.length === 0) {
        setDocChecked((c) => ({ ...c, [type]: false }));
      }
      return { ...prev, [type]: nextItems };
    });
  };

  const parsePrice = () => {
    const digits = priceText.replace(/[^\d]/g, "");
    return digits ? Number(digits) : NaN;
  };

  const validate = (): string | null => {
    if (images.some((img) => img.uploadStatus === "uploading")) {
      return "이미지 업로드가 끝날 때까지 기다려 주세요.";
    }
    if (
      DOC_OPTIONS.some((o) =>
        docs[o.type].some((d) => d.uploadStatus === "uploading")
      )
    ) {
      return "서류 이미지 업로드가 끝날 때까지 기다려 주세요.";
    }
    if (images.length < PRODUCT_POST_IMAGE_MIN) {
      return "상품 사진을 1장 이상 등록해 주세요.";
    }
    if (images.some((img) => !img.remoteUrl)) {
      return "업로드되지 않은 상품 사진이 있습니다. 다시 첨부해 주세요.";
    }
    const trimmedName = name.trim();
    if (
      trimmedName.length < PRODUCT_POST_NAME_MIN ||
      trimmedName.length > PRODUCT_POST_NAME_MAX
    ) {
      return `상품명은 ${PRODUCT_POST_NAME_MIN}~${PRODUCT_POST_NAME_MAX}자여야 합니다.`;
    }
    const categoryUuid =
      brandUuid || (brands.length === 0 && midUuid ? midUuid : "");
    if (!rootUuid || !midUuid) {
      return "카테고리를 선택해 주세요.";
    }
    if (brands.length > 0 && !brandUuid) {
      return "브랜드를 선택해 주세요.";
    }
    if (!categoryUuid) {
      return "카테고리와 브랜드를 선택해 주세요.";
    }
    if (!grade) return "상품 상태를 선택해 주세요.";
    const price = parsePrice();
    if (!Number.isFinite(price) || price < PRODUCT_POST_MIN_PRICE_WON) {
      return "500,000원 이상의 판매가격을 입력해 주세요.";
    }
    if (!placeName.trim()) return "거래희망장소를 입력해 주세요.";
    if (!description.trim()) return "상품설명을 입력해 주세요.";
    if (description.length > PRODUCT_POST_DESCRIPTION_MAX) {
      return `상품설명은 최대 ${PRODUCT_POST_DESCRIPTION_MAX}자입니다.`;
    }
    if (!agreed) return "판매 정보 책임 동의에 체크해 주세요.";
    if (countReadyDocuments(docs) < PRODUCT_POST_DOCUMENT_MIN) {
      return "첨부서류를 1장 이상 등록해 주세요.";
    }
    for (const opt of DOC_OPTIONS) {
      if (!docChecked[opt.type]) continue;
      if (docs[opt.type].length === 0) {
        return `${opt.label} 이미지를 첨부해 주세요.`;
      }
      if (docs[opt.type].some((d) => !d.remoteUrl)) {
        return `${opt.label} 업로드가 완료되지 않았습니다.`;
      }
      if (docs[opt.type].length > PRODUCT_POST_DOCUMENT_MAX_PER_TYPE) {
        return `서류는 종류별로 최대 ${PRODUCT_POST_DOCUMENT_MAX_PER_TYPE}개까지 등록할 수 있습니다.`;
      }
    }
    return null;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const msg = validate();
    if (msg) {
      setFieldError(msg);
      return;
    }
    setFieldError(null);
    setConfirmOpen(true);
  };

  const submitForm = () => {
    if (submitting) return;

    const categoryUuid =
      brandUuid || (brands.length === 0 && midUuid ? midUuid : "");
    const price = parsePrice();
    const post = initialValues?.post;

    const documents: ApiCreateProductPostDocument[] = DOC_OPTIONS.flatMap((o) =>
      docs[o.type]
        .filter((d) => Boolean(d.remoteUrl))
        .map((d) => ({
          documentType: o.type,
          imageUrl: d.remoteUrl!,
        }))
    );

    const body = {
      categoryUuid,
      productPostName: name.trim(),
      conditionGrade: grade as ConditionGrade,
      price,
      description: description.trim(),
      latitude:
        latitude != null
          ? latitude
          : post?.latitude != null
            ? post.latitude
            : PRODUCT_POST_DEFAULT_LATITUDE,
      longitude:
        longitude != null
          ? longitude
          : post?.longitude != null
            ? post.longitude
            : PRODUCT_POST_DEFAULT_LONGITUDE,
      placeName: placeName.trim(),
      regionDong: regionDong?.trim() || null,
      regionGu: regionGu?.trim() || null,
      images: images.map((img) => ({
        imageUrl: img.remoteUrl!,
      })),
      documents,
    };

    void (async () => {
      setSubmitting(true);
      setError(null);
      try {
        const result = isEdit
          ? await updateProductPostAction(
              initialValues!.post.productPostUuid,
              body
            )
          : await createProductPostAction(body);

        if (!result.ok) {
          setConfirmOpen(false);
          const docErr = pickDocumentsFieldError(result.fieldErrors);
          if (docErr) {
            setFieldError(docErr);
            setError(null);
          } else {
            setError(result.message);
          }
          notifyIfSessionExpiredAction(result);
          return;
        }

        setConfirmOpen(false);
        router.push(`${PRODUCT_POSTS_PATH}/${result.data.productPostUuid}`);
      } catch (e) {
        setConfirmOpen(false);
        setError(
          e instanceof Error
            ? e.message
            : isEdit
              ? "상품 수정 중 오류가 발생했습니다. 다시 시도해 주세요."
              : "상품 등록 중 오류가 발생했습니다. 다시 시도해 주세요."
        );
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 pb-16 pt-4 md:gap-[50px] md:px-8 md:pb-[100px] md:pt-[30px]"
    >
      <h1 className="font-sans text-xl font-medium tracking-tight text-white md:text-[30px] md:tracking-[-1.5px]">
        {isEdit ? "상품 수정하기" : "상품 등록하기"}
      </h1>

      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-[30px]">
        {/* 상품사진 — Figma: label100 + gap10 + upload520 = 630 */}
        <section className="flex w-full min-w-0 flex-col gap-2 md:w-[630px] md:shrink-0 md:flex-row md:items-start md:gap-2.5">
          <p className={cn(fieldLabelClassName, "md:w-[100px]")}>
            상품사진
            <span className="ml-0.5 text-vh-brand-gold" aria-hidden>
              *
            </span>
          </p>
          <div className="flex w-full min-w-0 flex-col gap-5 md:w-[520px] md:gap-[30px]">
            <input
              ref={imageInputRef}
              type="file"
              accept={MEDIA_IMAGE_ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => {
                addImages(e.target.files);
                e.target.value = "";
              }}
            />

            {/* PC 드롭존 — 520×292.5 */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addImages(e.dataTransfer.files);
              }}
              className="hidden aspect-[520/292.5] w-full flex-col items-center justify-center gap-5 border-2 border-dashed border-[#d9d9d9] px-4 py-6 md:flex"
            >
              <div className="flex flex-col items-center gap-2.5 text-center">
                <p className="font-sans text-base leading-[1.5] tracking-tight text-white">
                  첨부할 이미지를 여기에 끌어다 놓거나,
                  <br />
                  파일 선택 버튼을 직접 선택해주세요
                </p>
                <p className="font-sans text-sm leading-[1.5] tracking-tight text-[#ababab]">
                  이미지당 최대 5MB까지, 최대 {PRODUCT_POST_IMAGE_MAX}장의
                  이미지를 등록할 수 있습니다.
                  <br />
                  (jpg, jpeg, png, webp 지원)
                </p>
              </div>
              <span className="bg-[#fbefd8] px-2.5 py-2 font-sans text-base font-medium tracking-tight text-[#323232]">
                이미지 업로드
              </span>
            </button>

            {/* 모바일 */}
            <div className="md:hidden">
              <p className="mb-2 font-sans text-xs text-[#ababab]">
                이미지당 최대 5MB까지, 최대 {PRODUCT_POST_IMAGE_MAX}장 (jpg,
                jpeg, png, webp)
              </p>
              <ul className="grid grid-cols-4 gap-2">
                <li>
                  <button
                    type="button"
                    aria-label="이미지 추가"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex aspect-square w-full items-center justify-center bg-[#4a4a4a] text-2xl text-white"
                  >
                    +
                  </button>
                </li>
                {images.map((img, index) => (
                  <li key={img.id} className="relative aspect-square">
                    <ThumbCell
                      img={img}
                      isRep={index === 0}
                      onSelect={() => setRepresentative(img.id)}
                      onRemove={() => removeImage(img.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* PC 썸네일 — 520px: 1행(154안내+4장) / 2행(6장), thumb70 gap20 */}
            <div className="hidden w-full flex-col gap-5 md:flex">
              <div className="flex w-full items-center gap-[23px]">
                <div className="flex w-[154px] shrink-0 items-center gap-11">
                  <span className="font-sans text-lg tracking-tight text-white">
                    {images.length}/{PRODUCT_POST_IMAGE_MAX}
                  </span>
                  <p className="w-[70px] text-center font-sans text-sm leading-[1.4] tracking-tight text-[#ababab]">
                    대표사진을
                    <br />
                    선택해주세요
                  </p>
                </div>
                <ul className="flex gap-5">
                  {images.slice(0, 4).map((img, index) => (
                    <li key={img.id} className="relative size-[70px] shrink-0">
                      <ThumbCell
                        img={img}
                        isRep={index === 0}
                        onSelect={() => setRepresentative(img.id)}
                        onRemove={() => removeImage(img.id)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              {images.length > 4 ? (
                <ul className="flex gap-5">
                  {images.slice(4).map((img) => (
                    <li key={img.id} className="relative size-[70px] shrink-0">
                      <ThumbCell
                        img={img}
                        isRep={false}
                        onSelect={() => setRepresentative(img.id)}
                        onRemove={() => removeImage(img.id)}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>

        {/* 기본 정보 */}
        <section className="flex w-full min-w-0 flex-1 flex-col gap-5 md:gap-6">
          <CreateFieldRow label="상품명" required labelGap="md:gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={PRODUCT_POST_NAME_MAX}
              placeholder="상품명을 입력해 주세요"
              className={underlineInputClassName}
            />
          </CreateFieldRow>

          <CreateFieldRow label="카테고리" required>
            <div className="grid grid-cols-2 gap-5">
              <select
                value={rootUuid}
                onChange={(e) => {
                  const v = e.target.value;
                  setRootUuid(v);
                  void loadMids(v);
                }}
                className={selectClassName}
              >
                <option value="">대분류</option>
                {roots.map((r) => (
                  <option key={r.categoryUuid} value={r.categoryUuid}>
                    {r.categoryName}
                  </option>
                ))}
              </select>
              <select
                value={midUuid}
                disabled={!rootUuid}
                onChange={(e) => {
                  const v = e.target.value;
                  setMidUuid(v);
                  void loadBrands(v);
                }}
                className={selectClassName}
              >
                <option value="">중분류</option>
                {mids.map((m) => (
                  <option key={m.categoryUuid} value={m.categoryUuid}>
                    {m.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </CreateFieldRow>

          <CreateFieldRow label="브랜드" required>
            <select
              value={brandUuid}
              disabled={!midUuid}
              onChange={(e) => setBrandUuid(e.target.value)}
              className={selectClassName}
            >
              <option value="">
                {!midUuid
                  ? "브랜드를 선택해주세요."
                  : brands.length === 0
                    ? "하위 브랜드 없음 (중분류로 등록)"
                    : "브랜드를 선택해주세요."}
              </option>
              {brands.map((b) => (
                <option key={b.categoryUuid} value={b.categoryUuid}>
                  {b.categoryName}
                </option>
              ))}
            </select>
          </CreateFieldRow>

          <CreateFieldRow label="상품상태" required>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as ConditionGrade | "")}
              className={selectClassName}
            >
              <option value="">상품 상태를 선택해주세요.</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </CreateFieldRow>

          <CreateFieldRow label="판매가격" required align="start">
            <div className="flex w-full flex-col gap-2.5">
              <div className="flex items-center gap-1 border-b border-[#d0d0d0] px-1 py-2.5 focus-within:border-vh-brand-gold">
                <span className="font-sans text-base text-white">₩</span>
                <input
                  value={priceText}
                  onChange={(e) =>
                    setPriceText(e.target.value.replace(/[^\d,]/g, ""))
                  }
                  inputMode="numeric"
                  placeholder="판매가격을 입력해주세요."
                  className="w-full border-0 bg-transparent font-sans text-base text-white outline-none placeholder:text-[#868686]"
                />
              </div>
              <p className="font-sans text-sm text-[#ababab]">
                500,000원(오십만 원) 이상의 상품만 등록할 수 있습니다.
              </p>
            </div>
          </CreateFieldRow>

          {/* Figma 302:1016 — 장소명·변경버튼 gap-50, 그룹 정렬 */}
          <CreateFieldRow label="거래희망장소" required>
            {!placeName ? (
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="flex h-[42px] w-full items-center justify-center border border-[#d0d0d0] px-5 py-2 font-sans text-base tracking-tight text-white"
              >
                위치추가
              </button>
            ) : (
              <div className="flex w-full items-center gap-[50px]">
                <p className="min-w-0 truncate font-sans text-xl leading-[1.4] text-white">
                  {placeName}
                </p>
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  className="flex h-auto w-[180px] shrink-0 items-center justify-center border border-[#d0d0d0] px-5 py-2 font-sans text-base tracking-tight text-white"
                >
                  장소 변경하기
                </button>
              </div>
            )}
          </CreateFieldRow>
        </section>
      </div>

      {/* 상품설명 */}
      <CreateFieldRow
        label="상품설명"
        required
        align="start"
        sublabel={`최대 ${PRODUCT_POST_DESCRIPTION_MAX}자`}
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={PRODUCT_POST_DESCRIPTION_MAX}
          rows={8}
          className="h-[300px] w-full resize-y border border-[#d0d0d0] bg-transparent px-3.5 py-3.5 font-sans text-base text-white outline-none placeholder:text-[#ababab] focus:border-vh-brand-gold"
          placeholder={DESCRIPTION_PLACEHOLDER}
        />
      </CreateFieldRow>

      {/* 첨부서류 */}
      <section className="flex flex-col gap-4">
        <div>
          <p className="font-sans text-sm text-white">
            첨부서류 <span className="text-vh-brand-gold">*</span>
          </p>
          <p className="mt-1 font-sans text-xs text-[#ababab]">
            (필수 · 종류별 최대 {PRODUCT_POST_DOCUMENT_MAX_PER_TYPE}장 · 합계
            최대 {PRODUCT_POST_DOCUMENT_MAX_TOTAL}장 · 장당 5MB 이하 · jpg,
            jpeg, png, webp)
          </p>
        </div>
        <ul className="flex flex-wrap gap-4 md:gap-6">
          {DOC_OPTIONS.map((opt) => (
            <li key={opt.type}>
              <Checkbox
                id={`${formId}-doc-${opt.type}`}
                label={opt.label}
                checked={docChecked[opt.type]}
                onChange={(e) => toggleDoc(opt.type, e.target.checked)}
              />
            </li>
          ))}
        </ul>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOC_OPTIONS.filter((o) => docChecked[o.type]).map((opt) => {
            const items = docs[opt.type];
            const canAdd = items.length < PRODUCT_POST_DOCUMENT_MAX_PER_TYPE;
            return (
              <div
                key={opt.type}
                className="flex flex-col gap-2 border border-dashed border-[#868686] p-3"
              >
                <p className="font-sans text-xs text-[#d0d0d0]">
                  {opt.label} ({items.length}/
                  {PRODUCT_POST_DOCUMENT_MAX_PER_TYPE})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => (
                    <div key={item.id} className="relative aspect-square">
                      <Image
                        src={item.previewUrl}
                        alt={item.fileName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {item.uploadStatus === "uploading" ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Spinner
                            size="sm"
                            inline
                            aria-label="서류 업로드 중"
                          />
                        </span>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`${opt.label} 삭제`}
                        disabled={item.uploadStatus === "uploading"}
                        onClick={() => removeDocItem(opt.type, item.id)}
                        className="absolute right-0.5 top-0.5 z-10 flex size-3.5 items-center justify-center bg-black/50 text-xs leading-none text-white disabled:opacity-40"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {canAdd ? (
                    <label className="flex aspect-square cursor-pointer items-center justify-center bg-[#4a4a4a] text-2xl text-white">
                      +
                      <input
                        type="file"
                        accept={MEDIA_IMAGE_ACCEPT}
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          addDocFile(opt.type, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col items-center gap-4">
        <Checkbox
          id={`${formId}-agree`}
          label="판매 정보가 실제 상품과 다를 경우, 책임은 판매자에게 있음을 동의합니다."
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />

        {fieldError || error ? (
          <p
            className="text-center font-sans text-sm text-red-400"
            role="alert"
          >
            {fieldError ?? error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={submitting || (isEdit && !categoryReady)}
          className="h-12 w-full max-w-[449px] border-[#d0d0d0] text-base"
        >
          {submitting
            ? isEdit
              ? "수정 중…"
              : "등록 중…"
            : isEdit
              ? "수정하기"
              : "등록하기"}
        </Button>
      </div>

      <LocationRegisterDialog
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        initialPlaceName={placeName}
        initialLatitude={latitude}
        initialLongitude={longitude}
        initialRegionDong={regionDong}
        initialRegionGu={regionGu}
        onConfirm={(loc) => {
          setPlaceName(loc.placeName);
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
          setRegionDong(loc.regionDong?.trim() || null);
          setRegionGu(loc.regionGu?.trim() || null);
          setFieldError(null);
        }}
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!submitting) setConfirmOpen(open);
        }}
        title={isEdit ? "글을 수정하시겠습니까?" : "글을 등록하시겠습니까?"}
        primaryLabel="확인"
        secondaryLabel="취소"
        onPrimary={submitForm}
        onSecondary={() => {
          if (!submitting) setConfirmOpen(false);
        }}
        primaryPending={submitting}
      >
        <DialogDescription className="whitespace-pre-wrap text-left text-base leading-[1.5] text-[#323232]">
          {isEdit
            ? `입력하신 상품 정보로 판매글이 수정됩니다.
수정 후에도 상품 정보를 다시 변경할 수 있습니다.`
            : `입력하신 상품 정보와 등록 내용을 확인한 후 게시됩니다.
등록 후에도 상품 정보를 수정할 수 있습니다.`}
        </DialogDescription>
      </AlertDialog>
    </form>
  );
}
