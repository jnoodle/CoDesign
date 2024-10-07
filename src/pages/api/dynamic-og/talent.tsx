import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

import { formatNumber, formatString } from '@/utils/ogHelpers';

export const config = {
  runtime: 'edge',
};

// const mediumFontP = fetchAsset(
//   new URL('../../../../public/Inter-Medium.woff', import.meta.url),
// );
// const semiBoldFontP = fetchAsset(
//   new URL('../../../../public/Inter-SemiBold.woff', import.meta.url),
// );
// const boldFontP = fetchAsset(
//   new URL('../../../../public/Inter-Bold.woff', import.meta.url),
// );

export default async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // const [mediumFont, semiBoldFont, boldFont] = await Promise.all([
    //   mediumFontP,
    //   semiBoldFontP,
    //   boldFontP,
    // ]);

    const getParam = (name: any, processFn = (x: any) => x) =>
      searchParams.has(name) ? processFn(searchParams.get(name)) : null;

    const name = getParam('name', (x) => formatString(x, 24));
    const username = getParam('username', (x) => formatString(x, 28));
    const photo = getParam('photo', (x) => formatString(x, 100));

    const totalEarned = getParam('totalEarned', formatNumber);
    const submissionCount = getParam('submissionCount', formatNumber);
    const winnerCount = getParam('winnerCount', formatNumber);

    const skills = getParam('skills', (x) => JSON.parse(decodeURIComponent(x)));

    return new ImageResponse(
      (
        <div
          style={{
            backgroundImage:
              'url(https://codesign.top/assets/og/talent/bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '50px 50px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: 'white',
              height: '100%',
              borderRadius: '15px',
              padding: '45px 60px 25px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                }}
              >
                {photo && (
                  <img
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain',
                      borderRadius: '120px',
                    }}
                    alt="pfp"
                    src={photo as string}
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      fontSize: 46,
                      fontStyle: 'normal',
                      color: 'black',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"Bold"',
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 34,
                      fontStyle: 'normal',
                      color: '#64748B',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"SemiBold"',
                      marginTop: '-8px',
                    }}
                  >
                    @{username}
                  </div>
                </div>
              </div>
              <svg width="126" height="32" xmlns="http://www.w3.org/2000/svg">
                <g fill-rule="nonzero" fill="none">
                  <path
                    d="m9.808 5.654.002 1.999c1.429.228 2.623.794 3.581 1.697 1.282 1.209 1.933 2.818 1.954 4.827h-4.253c-.021-.88-.293-1.593-.817-2.143-.523-.55-1.213-.824-2.072-.824-1.056 0-1.854.385-2.393 1.154C5.27 13.133 5 14.38 5 16.107v.471c0 1.748.267 3.004.8 3.767.535.764 1.346 1.146 2.434 1.146.837 0 1.517-.23 2.04-.69.524-.46.796-1.073.817-1.837h4.253a5.819 5.819 0 0 1-.941 3.163c-.618.957-1.463 1.7-2.535 2.229a7.573 7.573 0 0 1-2.06.667v1.857h-3.58l-.002-1.949c-1.466-.328-2.686-1.027-3.659-2.098C1.166 21.29.465 19.158.465 16.437v-.298c0-2.616.696-4.704 2.088-6.263.972-1.089 2.197-1.798 3.674-2.126l.001-2.096h3.58ZM16.643 16.186c0-1.685.324-3.186.973-4.505.649-1.318 1.583-2.339 2.802-3.06 1.219-.723 2.634-1.084 4.246-1.084 2.291 0 4.162.701 5.611 2.104 1.45 1.402 2.258 3.306 2.425 5.713l.032 1.162c0 2.605-.728 4.695-2.182 6.27-1.455 1.575-3.406 2.363-5.855 2.363-2.449 0-4.403-.785-5.863-2.355-1.46-1.57-2.19-3.704-2.19-6.404v-.204Zm4.536.33c0 1.611.304 2.843.91 3.696.607.853 1.476 1.28 2.606 1.28 1.099 0 1.957-.422 2.574-1.264.618-.843.926-2.19.926-4.042 0-1.58-.308-2.805-.926-3.673-.617-.869-1.486-1.303-2.605-1.303-1.11 0-1.968.432-2.575 1.295-.606.863-.91 2.2-.91 4.01Z"
                    fill="#A259FF"
                  />
                  <path
                    d="M34.233 16.217c0-2.647.594-4.756 1.782-6.325 1.187-1.57 2.812-2.355 4.873-2.355 1.654 0 3.02.618 4.097 1.852V.725h4.552v24.11H45.44l-.22-1.805c-1.13 1.412-2.584 2.119-4.363 2.119-1.999 0-3.602-.788-4.811-2.363s-1.813-3.764-1.813-6.569Zm4.536.33c0 1.59.278 2.81.832 3.657.555.848 1.36 1.272 2.418 1.272 1.402 0 2.39-.592 2.966-1.774V13c-.565-1.183-1.543-1.774-2.935-1.774-2.187 0-3.28 1.774-3.28 5.32ZM60.284 25.149c-2.49 0-4.518-.764-6.083-2.292-1.564-1.528-2.346-3.563-2.346-6.106v-.44c0-1.705.33-3.23.989-4.575.659-1.345 1.593-2.38 2.801-3.108 1.21-.727 2.588-1.09 4.136-1.09 2.324 0 4.152.732 5.486 2.197 1.335 1.465 2.002 3.542 2.002 6.231v1.852H56.454c.146 1.11.588 1.999 1.326 2.669.738.67 1.672 1.004 2.802 1.004 1.748 0 3.113-.633 4.097-1.899l2.229 2.496c-.68.962-1.601 1.713-2.763 2.252-1.161.54-2.449.809-3.861.809Zm-.518-13.939c-.9 0-1.63.304-2.19.91-.56.607-.918 1.476-1.075 2.606h6.31v-.36c-.021-1.005-.293-1.782-.816-2.332-.524-.55-1.267-.824-2.23-.824ZM78.455 20.141c0-.554-.275-.991-.824-1.31-.55-.32-1.431-.605-2.645-.856-4.04-.847-6.059-2.563-6.059-5.148 0-1.507.625-2.765 1.876-3.775 1.25-1.01 2.885-1.515 4.905-1.515 2.156 0 3.88.508 5.172 1.523 1.292 1.015 1.938 2.333 1.938 3.955h-4.536c0-.649-.21-1.185-.628-1.609-.418-.423-1.072-.635-1.962-.635-.764 0-1.355.172-1.773.518a1.635 1.635 0 0 0-.628 1.318c0 .502.238.908.714 1.217.476.308 1.28.575 2.41.8 1.13.225 2.082.479 2.856.761 2.396.88 3.595 2.402 3.595 4.568 0 1.549-.665 2.802-1.994 3.76-1.329.957-3.045 1.436-5.148 1.436-1.423 0-2.687-.254-3.791-.762-1.104-.507-1.97-1.203-2.598-2.087-.628-.885-.942-1.84-.942-2.865h4.301c.042.806.34 1.423.895 1.852.555.43 1.298.644 2.229.644.868 0 1.525-.165 1.97-.495.444-.33.667-.76.667-1.295ZM89.986 24.835h-4.552V7.85h4.552v16.984ZM85.168 3.456c0-.68.227-1.24.682-1.68.456-.439 1.076-.659 1.86-.659.775 0 1.392.22 1.853.66.46.44.69.999.69 1.68 0 .69-.233 1.255-.698 1.694-.466.44-1.08.66-1.845.66-.764 0-1.378-.22-1.844-.66-.466-.44-.698-1.004-.698-1.695ZM92.477 16.217c0-2.605.62-4.703 1.86-6.294 1.24-1.59 2.911-2.386 5.015-2.386 1.862 0 3.312.639 4.348 1.915l.188-1.6H108V24.27c0 1.485-.337 2.778-1.012 3.877-.675 1.098-1.625 1.935-2.849 2.51-1.224.576-2.658.864-4.3.864a9.313 9.313 0 0 1-3.642-.745c-1.183-.497-2.077-1.138-2.684-1.923l2.009-2.763c1.13 1.266 2.5 1.9 4.112 1.9 1.204 0 2.14-.322 2.81-.966.67-.643 1.005-1.556 1.005-2.739v-.91c-1.047 1.182-2.423 1.774-4.129 1.774-2.04 0-3.69-.798-4.952-2.394-1.26-1.596-1.891-3.712-1.891-6.35v-.188Zm4.536.33c0 1.538.309 2.744.926 3.618.617.874 1.465 1.31 2.543 1.31 1.381 0 2.37-.517 2.967-1.553V12.78c-.607-1.036-1.586-1.554-2.936-1.554-1.088 0-1.943.445-2.566 1.334-.623.89-.934 2.218-.934 3.987ZM115.074 7.851l.141 1.962c1.214-1.517 2.842-2.276 4.882-2.276 1.8 0 3.14.529 4.018 1.586.88 1.056 1.33 2.637 1.35 4.74v10.972h-4.536V13.973c0-.963-.21-1.661-.628-2.096-.418-.434-1.114-.651-2.088-.651-1.276 0-2.234.544-2.872 1.632v11.977h-4.536V7.85h4.27Z"
                    fill="#334155"
                  />
                </g>
              </svg>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: '150px',
              }}
            >
              <p
                style={{
                  color: '#64748B',
                  fontFamily: 'Medium',
                  fontSize: '26px',
                }}
              >
                Skills
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {skills?.map((skill: { skills: string }) => (
                  <p
                    key={skills.skills}
                    style={{
                      color: '#475569',
                      fontFamily: 'Medium',
                      fontSize: '22px',
                      backgroundColor: '#F1F5F9',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      margin: '0px',
                    }}
                  >
                    {skill.skills}
                  </p>
                ))}
              </div>
              <hr
                style={{
                  width: '100%',
                  borderColor: '#CBD5E1',
                  borderWidth: '1px',
                  marginTop: '24px',
                  marginBottom: '24px',
                }}
              />
              <div style={{ display: 'flex', gap: '60px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p
                    style={{
                      color: 'Black',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                    }}
                  >
                    ${totalEarned}
                  </p>
                  <p
                    style={{
                      color: '#64748B',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                      marginTop: '-12px',
                    }}
                  >
                    Total Earned
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p
                    style={{
                      color: 'Black',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                    }}
                  >
                    {submissionCount}
                  </p>
                  <p
                    style={{
                      color: '#64748B',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                      marginTop: '-12px',
                    }}
                  >
                    Participated
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p
                    style={{
                      color: 'Black',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                    }}
                  >
                    {winnerCount}
                  </p>
                  <p
                    style={{
                      color: '#64748B',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                      marginTop: '-12px',
                    }}
                  >
                    Won
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // fonts: [
        //   { name: 'Medium', data: mediumFont, style: 'normal' },
        //   { name: 'SemiBold', data: semiBoldFont, style: 'normal' },
        //   { name: 'Bold', data: boldFont, style: 'normal' },
        // ],
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
