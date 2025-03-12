

const { isNonAcademic } = require('./index'); 

describe('isNonAcademic', () => {
    test('Identifies non-academic author correctly', () => {
        const affiliation = 'XYZ Biotech';
        expect(isNonAcademic(affiliation)).toBe(true);
    });

    test('Identifies academic author correctly', () => {
        const affiliation = 'Harvard University';
        expect(isNonAcademic(affiliation)).toBe(false);
    });

    test('Identifies non-academic author by email domain', () => {
        const affiliation = 'Unknown';
        expect(isNonAcademic(affiliation)).toBe(false);
    });

    test('Handles empty affiliation', () => {
        expect(isNonAcademic('')).toBe(false);
    });

    test('Handles undefined affiliation', () => {
        expect(isNonAcademic(undefined)).toBe(false);
    });

    test('Identifies pharmaceutical company affiliation', () => {
        const affiliation = 'ABC Pharmaceuticals';
        expect(isNonAcademic(affiliation)).toBe(true);
    });
});
