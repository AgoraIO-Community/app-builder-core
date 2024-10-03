import React, {useState, ReactNode, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  StyleSheet,
} from 'react-native';
import {ThemeConfig, $config, ImageIcon} from 'customization-api';

// Enable Layout Animation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// TypeScript Interfaces
interface BaseAccordionProps {
  children: ReactNode;
}

interface BaseAccordionHeaderProps {
  title: string;
  expandIcon?: React.ReactNode;
  id: string;
  isOpen: boolean; // Pass this prop explicitly
  onPress: () => void; // Handle toggle functionality
  children: React.ReactNode;
}

interface BaseAccordionContentProps {
  children: ReactNode;
}

// Main Accordion Component to render multiple AccordionItems
const BaseAccordion: React.FC<BaseAccordionProps> = ({children}) => {
  return <View style={styles.accordionContainer}>{children}</View>;
};

// AccordionItem Component to manage isOpen state
const BaseAccordionItem: React.FC<{children: ReactNode; open?: boolean}> = ({
  children,
  open = false,
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  // Separate AccordionHeader and AccordionContent components from children
  const header = React.Children.toArray(children).find(
    (child: any) => child.type === BaseAccordionHeader,
  );
  const content = React.Children.toArray(children).find(
    (child: any) => child.type === BaseAccordionContent,
  );

  return (
    <View style={styles.accordionItem}>
      {/* Clone and pass props to AccordionHeader */}
      {header &&
        React.cloneElement(header as React.ReactElement<any>, {
          isOpen, // Pass the isOpen state
          onPress: toggleAccordion, // Pass the toggleAccordion function
        })}
      {isOpen && content}
    </View>
  );
};

// AccordionHeader Component for the Accordion Header
const BaseAccordionHeader: React.FC<Partial<BaseAccordionHeaderProps>> = ({
  title,
  isOpen,
  onPress,
  children,
}) => {
  return (
    <TouchableOpacity style={styles.accordionHeader} onPress={onPress}>
      <View style={styles.headerContent}>
        <Text style={styles.accordionTitle}>{title}</Text>
        {children && <View>{children}</View>}
      </View>
      <View style={styles.expandIcon}>
        <ImageIcon
          iconType="plain"
          name={isOpen ? 'arrow-up' : 'arrow-down'}
          iconSize={20}
          tintColor={$config.FONT_COLOR}
        />
      </View>
    </TouchableOpacity>
  );
};

// AccordionContent Component for the Accordion Content
const BaseAccordionContent: React.FC<BaseAccordionContentProps> = ({
  children,
}) => {
  return <View style={styles.accordionContent}>{children}</View>;
};

export {
  BaseAccordion,
  BaseAccordionItem,
  BaseAccordionHeader,
  BaseAccordionContent,
};

// Styles for Accordion Components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F5FCFF',
  },
  accordionContainer: {
    // marginVertical: 10,
  },
  accordionItem: {
    marginBottom: 8,
    borderRadius: 8,
  },
  accordionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 19,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 36,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginLeft: 8,
  },
  accordionContent: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  accordionTitle: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '700',
    lineHeight: 12,
  },
  accordionContentText: {
    fontSize: 14,
    color: '#333',
  },
});
