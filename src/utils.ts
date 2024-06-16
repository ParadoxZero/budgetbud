export enum ScreenSize {
    mobile = 0,
    tablet = 1,
    desktop = 2
}

export function GetScreenSize(): ScreenSize {
    if (window.innerWidth <= 768) {
        return ScreenSize.mobile
    } else if (window.innerWidth <= 1024) {
        return ScreenSize.tablet
    } else {
        return ScreenSize.desktop
    }
}